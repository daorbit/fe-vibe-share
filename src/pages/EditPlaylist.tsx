import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import CreatePlaylist from "./CreatePlaylist";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { fetchFeedPlaylists } from "@/store/slices/playlistSlice";
import { useAppDispatch } from "@/store/hooks";
import { playlistsAPI } from "@/lib/api";
import { message } from "antd";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const EditPlaylist = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlaylist, updatePlaylist, addSongToPlaylist, addSongsToPlaylist, deletePlaylist } = usePlaylist();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();

  const [isLoading, setIsLoading] = useState(true);
  const [playlist, setPlaylist] = useState<any | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteType, setDeleteType] = useState<'playlist' | 'songs' | null>(null);
  const [songsToDelete, setSongsToDelete] = useState<string[]>([]);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [songToDeleteNow, setSongToDeleteNow] = useState<string | null>(null);
  const [showSongDeleteConfirmation, setShowSongDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (!id) return navigate('/profile');

    const fetchPlaylist = async () => {
      setIsLoading(true);
      try {
        const data = await getPlaylist(id);
        setPlaylist(data);
      } catch (err) {
        console.error('Failed to load playlist:', err);
        message.error('Failed to load playlist');
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [id, navigate, getPlaylist]);

  const proceedWithSubmit = async (payload: any, removedSongIds: string[]) => {
    // Songs are already deleted via API when user clicks delete button
    // No need to delete them again here

    // add new songs (those without an id)
    const newSongs = (payload.songs || []).filter((s: any) => !s.id);
    if (newSongs.length > 0) {
      await addSongsToPlaylist(id!, newSongs.map(song => ({
        title: song.title,
        artist: song.artist,
        url: song.url,
        platform: song.platform,
      })));
    }

    // upload thumbnail if provided
    if (payload.thumbnailFile) {
      try {
        await playlistsAPI.uploadPlaylistThumbnail(id, payload.thumbnailFile);
      } catch (err) {
        console.error('Thumbnail upload failed:', err);
        message.error('Playlist saved but thumbnail upload failed');
      }
    }

    // remove thumbnail if requested
    if (payload.removeThumbnail && playlist?.thumbnailUrl) {
      try {
        await playlistsAPI.removePlaylistThumbnail(id);
      } catch (err) {
        console.error('Thumbnail removal failed:', err);
        message.error('Playlist saved but thumbnail removal failed');
      }
    }

    message.success('Playlist saved');
    dispatch(fetchFeedPlaylists({ limit: 10, page: 1 }));
    navigate(`/playlist/${id}`);
  };

  const handleSubmit = async (payload: any) => {
    if (!id) return;
    try {
      // Update basic playlist fields
      await updatePlaylist(id, {
        title: payload.title,
        description: payload.description,
        coverGradient: payload.coverGradient,
        tags: payload.tags,
        isPublic: payload.isPublic,
      });

      // Delete songs that were removed in the editor
      const originalSongIds: string[] = (playlist?.songs || []).map((s: any) => s.id).filter(Boolean);
      const currentSongIds: string[] = (payload.songs || []).map((s: any) => s.id).filter(Boolean);
      const removedSongIds = originalSongIds.filter((sid) => !currentSongIds.includes(sid));

      // No confirmation needed on save - user already confirmed when deleting each song
      await proceedWithSubmit(payload, removedSongIds);
    } catch (err) {
      console.error('Failed to save playlist:', err);
      message.error('Failed to save playlist');
    }
  };

  const handleDelete = () => {
    setDeleteType('playlist');
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (deleteType === 'playlist') {
      if (!id) return;
      try {
        await deletePlaylist(id);
        message.success('Playlist deleted');
        navigate('/profile');
      } catch (err) {
        console.error('Failed to delete playlist:', err);
        message.error('Failed to delete playlist');
      }
    } else if (deleteType === 'songs') {
      if (pendingPayload) {
        await proceedWithSubmit(pendingPayload, songsToDelete);
      }
    }
    setShowDeleteConfirmation(false);
    setDeleteType(null);
    setSongsToDelete([]);
    setPendingPayload(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Playlist not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CreatePlaylist
        initialData={{
          id: playlist.id,
          title: playlist.title,
          description: playlist.description,
          coverGradient: playlist.coverGradient,
          tags: playlist.tags || [],
          songs: playlist.songs || [],
          thumbnailUrl: playlist.thumbnailUrl || null,
          isPublic: playlist.isPublic ?? true,
        }}
        onSubmit={handleSubmit}
        confirmBeforeDelete={true}
      />

      {/* Delete action placed below the form so user can delete here as well */}
      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="pt-6 border-t border-border">
          <button
            onClick={handleDelete}
            className="w-full py-3 bg-destructive text-destructive-foreground rounded-lg"
          >
            Delete Playlist
          </button>
        </div>
      </div>

      {/* Confirmation Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <SheetContent side="top" className="max-h-[50vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {deleteType === 'playlist' ? 'Delete Playlist' : 'Delete Songs'}
              </SheetTitle>
              <SheetDescription>
                {deleteType === 'playlist'
                  ? 'Are you sure you want to delete this playlist? This action cannot be undone.'
                  : `Are you sure you want to delete ${songsToDelete.length} song${songsToDelete.length > 1 ? 's' : ''}? This action cannot be undone.`
                }
              </SheetDescription>
            </SheetHeader>
            <SheetFooter className="flex-row gap-2 mt-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 py-1 px-4 border border-border rounded-[8px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-1 px-4 bg-destructive text-destructive-foreground rounded-[8px]"
              >
                Delete
              </button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {deleteType === 'playlist' ? 'Delete Playlist' : 'Delete Songs'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteType === 'playlist'
                  ? 'Are you sure you want to delete this playlist? This action cannot be undone.'
                  : `Are you sure you want to delete ${songsToDelete.length} song${songsToDelete.length > 1 ? 's' : ''}? This action cannot be undone.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-[8px]">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default EditPlaylist;

 