import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Link2,
  Loader2,
  X,
  Tag,
  Upload,
  Image,
  Lock,
  Globe,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { usePlaylist, SongLink } from "@/contexts/PlaylistContext";
import { useAppSelector } from "@/store/hooks";
import { gradients } from "@/lib/songUtils";
import { playlistsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { message } from "antd";
import AddSongSheet from "@/components/AddSongSheet";
import SortableSongItem from "@/components/SortableSongItem";
import ImageCropModal from "@/components/ImageCropModal";
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

const suggestedTags = [
  "chill",
  "vibes",
  "workout",
  "study",
  "party",
  "roadtrip",
];

type SongWithTempId = Omit<SongLink, "id"> & { tempId: string; id?: string };

type CreatePlaylistProps = {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    coverGradient?: string;
    tags?: string[];
    songs?: SongLink[];
    thumbnailUrl?: string | null;
    isPublic?: boolean;
  };
  onSubmit?: (payload: {
    title: string;
    description: string;
    coverGradient: string;
    tags: string[];
    songs: Array<Partial<SongLink> & { tempId?: string }>; // may include existing ids
    thumbnailFile?: File | null;
    removeThumbnail?: boolean;
    isPublic: boolean;
  }) => Promise<void>;
  onDelete?: () => void;
  confirmBeforeDelete?: boolean;
};

const CreatePlaylist = ({
  initialData,
  onSubmit,
  onDelete,
  confirmBeforeDelete = false,
}: CreatePlaylistProps = {}) => {
  const navigate = useNavigate();
  const { createPlaylist, addSongToPlaylist, addSongsToPlaylist } =
    usePlaylist();
  const user = useAppSelector((state) => state.auth.user);
  const isLoggedIn = !!user;
  const isMobile = useIsMobile();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [selectedGradient, setSelectedGradient] = useState(
    initialData?.coverGradient || gradients[0],
  );
  const [songs, setSongs] = useState<SongWithTempId[]>(
    (initialData?.songs || []).map((s) => ({
      ...s,
      tempId: s.id || crypto.randomUUID(),
    })),
  );
  const [songToDelete, setSongToDelete] = useState<{
    tempId: string;
    title: string;
    id?: string;
  } | null>(null);
  const [isDeletingSong, setIsDeletingSong] = useState(false);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [showAddSong, setShowAddSong] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnailUrl || null,
  );
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/sign-in");
    }
  }, [isLoggedIn, navigate]);

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 5) {
      setTags([...tags, normalizedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleAddSong = (song: Omit<SongLink, "id">) => {
    setSongs([...songs, { ...song, tempId: crypto.randomUUID() }]);
  };

  const handleRemoveSong = (tempId: string) => {
    if (confirmBeforeDelete) {
      const song = songs.find((s) => s.tempId === tempId);
      if (song) {
        setSongToDelete({ tempId, title: song.title, id: song.id });
      }
    } else {
      setSongs(songs.filter((s) => s.tempId !== tempId));
    }
  };

  const confirmRemoveSong = async () => {
    if (songToDelete) {
      setIsDeletingSong(true);
      try {
        // If the song has an id, it's already saved in the database, so delete it
        if (songToDelete.id) {
          await playlistsAPI.deleteSong(songToDelete.id);
          message.success("Song removed");
        }
        // Remove from local state
        setSongs(songs.filter((s) => s.tempId !== songToDelete.tempId));
        setSongToDelete(null);
      } catch (err) {
        console.error("Failed to delete song:", err);
        message.error("Failed to remove song");
      } finally {
        setIsDeletingSong(false);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSongs((items) => {
        const oldIndex = items.findIndex((i) => i.tempId === active.id);
        const newIndex = items.findIndex((i) => i.tempId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleThumbnailSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        message.error("Image must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        message.error("Please select an image file");
        return;
      }

      // Show image in crop modal
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToCrop(e.target?.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    // Convert blob to file
    const croppedFile = new File([croppedImageBlob], "playlist-thumbnail.jpg", {
      type: "image/jpeg",
    });

    setThumbnailFile(croppedFile);

    // Create preview URL from blob
    const previewUrl = URL.createObjectURL(croppedImageBlob);
    setThumbnailPreview(previewUrl);
    setRemoveThumbnail(false);
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (initialData?.thumbnailUrl) setRemoveThumbnail(true);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsCreating(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      coverGradient: selectedGradient,
      tags,
      songs,
      thumbnailFile,
      removeThumbnail,
      isPublic,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload as any);
        return;
      }

      // default create behavior
      const playlist = await createPlaylist({
        title: payload.title,
        description: payload.description,
        coverGradient: payload.coverGradient,
        tags: payload.tags,
        isPublic: payload.isPublic,
      });

      // Add all new songs in a single batch request
      const newSongs = songs.filter((song) => !song.id);
      if (newSongs.length > 0) {
        await addSongsToPlaylist(
          playlist.id,
          newSongs.map((song) => ({
            title: song.title,
            artist: song.artist,
            url: song.url,
            platform: song.platform,
          })),
        );
      }

      if (thumbnailFile) {
        try {
          await playlistsAPI.uploadPlaylistThumbnail(
            playlist.id,
            thumbnailFile,
          );
        } catch (thumbnailError) {
          console.error("Failed to upload thumbnail:", thumbnailError);
          message.error("Playlist created, but thumbnail upload failed");
        }
      }

      message.success("Playlist created successfully!");
      navigate(`/playlist/${playlist.id}`);
    } catch (err) {
      console.error("Failed to create/update playlist:", err);
      message.error("Failed to save playlist");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Cover + Title Row */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden ${
                thumbnailPreview ? "" : `bg-gradient-to-br ${selectedGradient}`
              }`}
            >
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Link2 className="w-6 h-6 text-white/60" />
              )}
            </div>
            {thumbnailPreview && (
              <button
                onClick={handleRemoveThumbnail}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground text-xs hover:bg-destructive/80"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Playlist name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 bg-card border-border/40 rounded-[8px]"
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-8 bg-card border-border/40 rounded-[8px] text-sm"
            />
          </div>
        </div>

        {/* Compact Color Picker */}
        <div className="flex gap-1.5 flex-wrap">
          {gradients.map((gradient, index) => (
            <button
              key={index}
              onClick={() => setSelectedGradient(gradient)}
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} transition-all ${
                selectedGradient === gradient
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                  : "hover:scale-105"
              }`}
            />
          ))}
        </div>

        {/* Compact Thumbnail Upload */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailSelect}
            className="hidden"
            id="thumbnail-upload"
          />
          <label
            htmlFor="thumbnail-upload"
            className="flex items-center gap-1.5 px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-[8px] cursor-pointer transition-colors text-xs"
          >
            <Upload className="w-3 h-3" />
            {thumbnailFile ? "Change" : "Upload"}
          </label>
          {thumbnailFile && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {thumbnailFile.name}
            </span>
          )}
        </div>

        {/* Compact Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/15 text-primary rounded-full text-xs font-medium"
            >
              #{tag}
              <button onClick={() => handleRemoveTag(tag)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {tags.length < 5 && (
            <Input
              placeholder="Add tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="h-7 w-20 bg-transparent border-0 text-xs px-1 focus-visible:ring-0"
            />
          )}
        </div>

        {/* Quick suggested tags */}
        {tags.length < 5 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestedTags
              .filter((t) => !tags.includes(t))
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  className="px-2 py-0.5 bg-muted hover:bg-muted/80 rounded-full text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  #{tag}
                </button>
              ))}
          </div>
        )}

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/40">
          <div className="flex items-center gap-2">
            {isPublic ? (
              <Globe className="w-4 h-4 text-primary" />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {isPublic ? "Public" : "Private"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? "Anyone can see this playlist"
                  : "Only you can see this playlist"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPublic ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublic ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Songs Section - Scrollable */}
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between py-3 border-t border-border/30">
          <span className="text-sm font-semibold">Songs ({songs.length})</span>
          <button
            onClick={() => setShowAddSong(true)}
            className="flex items-center gap-1 text-primary text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {songs.length === 0 ? (
          <button
            onClick={() => setShowAddSong(true)}
            className="w-full py-10 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="text-sm">Tap to add your first song</span>
            <span className="text-xs">YouTube, Spotify, SoundCloud...</span>
          </button>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={songs.map((s) => s.tempId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {songs.map((song, index) => (
                  <SortableSongItem
                    key={song.tempId}
                    song={song}
                    index={index}
                    onRemove={() => handleRemoveSong(song.tempId)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {songs.length > 0 && (
          <button
            onClick={() => setShowAddSong(true)}
            className="w-full mt-3 py-3 border border-dashed border-border/50 rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add another song</span>
          </button>
        )}
      </div>

      {/* Add Song Sheet */}
      <AddSongSheet
        isOpen={showAddSong}
        onClose={() => setShowAddSong(false)}
        onAdd={handleAddSong}
        existingSongs={songs}
      />

      {/* Song Delete Confirmation */}
      {isMobile ? (
        <Sheet
          open={!!songToDelete}
          onOpenChange={(open) => !open && setSongToDelete(null)}
        >
          <SheetContent side="top" className="max-h-[50vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Delete Song</SheetTitle>
              <SheetDescription>
                Are you sure you want to remove "{songToDelete?.title}" from
                this playlist?
              </SheetDescription>
            </SheetHeader>
            <SheetFooter className="flex-row gap-2 mt-4">
              <button
                onClick={() => setSongToDelete(null)}
                disabled={isDeletingSong}
                className="flex-1 py-1 px-4 border border-border rounded-[8px] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveSong}
                disabled={isDeletingSong}
                className="flex-1 py-1 px-4 bg-destructive text-destructive-foreground rounded-[8px] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingSong && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <AlertDialog
          open={!!songToDelete}
          onOpenChange={(open) => !open && setSongToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Song</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{songToDelete?.title}" from
                this playlist?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingSong}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveSong}
                disabled={isDeletingSong}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-[8px] disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingSong && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Fixed Bottom Bar with Delete, Cancel and Save/Create Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/30">
        <div className="max-w-lg mx-auto px-4 py-3 space-y-2">
          {/* Delete Button (only in edit mode) */}
          {initialData && onDelete && (
            <Button
              size="lg"
              variant="destructive"
              onClick={onDelete}
              disabled={isCreating}
              className="w-full h-10 rounded-lg font-semibold"
            >
              Delete Playlist
            </Button>
          )}

          {/* Cancel and Save Row */}
          <div className="flex gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isCreating}
              className="flex-1 h-10 rounded-lg font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={handleCreate}
              disabled={!title.trim() || isCreating}
              className="flex-1 h-10 rounded-lg font-semibold"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {initialData ? "Saving..." : "Creating..."}
                </>
              ) : initialData ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </div>
      {cropModalOpen && (
        <ImageCropModal
          open={cropModalOpen}
          imageSrc={imageToCrop}
          cropShape="rect"
          aspect={1}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default CreatePlaylist;
