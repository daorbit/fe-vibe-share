import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music2, Play, ChevronDown, LogIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playlistsAPI } from "@/lib/api";
import { getPlatformColor, getPlatformIcon } from "@/lib/songUtils";
import { useAppSelector } from "@/store/hooks";

interface PlaylistsTabProps {
  onPlayPlaylist: (songs: any[], startIndex: number, playlistId: string, playlistTitle: string) => void;
}

export const PlaylistsTab = ({ onPlayPlaylist }: PlaylistsTabProps) => {
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => !!state.auth.user);

  const { data: playlistsData, isLoading } = useQuery({
    queryKey: ["saved-playlists"],
    queryFn: () => playlistsAPI.getSavedPlaylists({ limit: 50 }),
    enabled: isLoggedIn,
  });

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Music2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-base font-semibold mb-2">Sign in to see your playlists</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-[240px]">
          Save playlists from your feed and access them here anytime
        </p>
        <Button onClick={() => navigate("/sign-in")} className="gap-2">
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 pb-24">
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}
        {!isLoading && playlistsData?.data?.playlists?.length > 0 && (
          <div className="space-y-1.5">
            {playlistsData.data.playlists.map((playlist: any) => (
              <PlaylistItem
                key={playlist._id}
                playlist={playlist}
                onPlay={onPlayPlaylist}
              />
            ))}
          </div>
        )}
        {!isLoading && !playlistsData?.data?.playlists?.length && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Music2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No saved playlists yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Save playlists from your feed</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

interface PlaylistItemProps {
  playlist: any;
  onPlay: (songs: any[], startIndex: number, playlistId: string, playlistTitle: string) => void;
}

const PlaylistItem = ({ playlist, onPlay }: PlaylistItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);

  const handleToggle = async () => {
    if (!isExpanded && songs.length === 0) {
      setLoadingSongs(true);
      try {
        const response = await playlistsAPI.getPlaylistSongs(playlist._id);
        setSongs(response.data?.songs || response.songs || []);
      } catch (error) {
        console.error("Error fetching playlist songs:", error);
      } finally {
        setLoadingSongs(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const handlePlaySong = (index: number) => {
    if (songs.length > 0) {
      onPlay(songs, index, playlist._id, playlist.title);
    }
  };

  const handlePlayAll = async () => {
    if (songs.length === 0) {
      setLoadingSongs(true);
      try {
        const response = await playlistsAPI.getPlaylistSongs(playlist._id);
        const fetchedSongs = response.data?.songs || response.songs || [];
        setSongs(fetchedSongs);
        if (fetchedSongs.length > 0) {
          onPlay(fetchedSongs, 0, playlist._id, playlist.title);
        }
      } catch (error) {
        console.error("Error fetching playlist songs:", error);
      } finally {
        setLoadingSongs(false);
      }
    } else {
      onPlay(songs, 0, playlist._id, playlist.title);
    }
  };

  return (
    <div className="border border-border/30 rounded-lg overflow-hidden bg-card/50">
      <div className="flex items-center gap-2 p-2">
        {playlist.thumbnailUrl ? (
          <img
            src={playlist.thumbnailUrl}
            alt={playlist.title}
            className="w-12 h-12 rounded object-cover shrink-0"
          />
        ) : (
          <div
            className="w-12 h-12 rounded flex items-center justify-center shrink-0 text-white"
            style={{ background: playlist.coverGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            <Music2 className="w-5 h-5" />
          </div>
        )}

        <button onClick={handleToggle} className="flex-1 min-w-0 text-left">
          <p className="text-xs font-medium leading-tight line-clamp-2 mb-0.5">{playlist.title}</p>
          <p className="text-[10px] text-muted-foreground truncate leading-tight">
            {playlist.creator?.username || playlist.username || "Unknown"} • {playlist.songCount || 0} songs
          </p>
        </button>

        <Button size="icon" className="h-8 w-8 shrink-0" onClick={handlePlayAll} disabled={loadingSongs}>
          <Play className="w-3.5 h-3.5" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleToggle}>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
        </Button>
      </div>

      {isExpanded && (
        <div className="border-t border-border/20">
          {loadingSongs ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-xs text-muted-foreground">Loading songs...</div>
            </div>
          ) : songs.length > 0 ? (
            <div>
              {songs.map((song, index) => (
                <button
                  key={song._id || index}
                  onClick={() => handlePlaySong(index)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-muted/30 transition-colors border-b border-border/10 last:border-b-0"
                >
                  <span className="text-[10px] text-muted-foreground w-4 shrink-0">{index + 1}</span>
                  {song.thumbnail ? (
                    <img src={song.thumbnail} alt="" className="w-12 h-9 rounded object-cover shrink-0" />
                  ) : (
                    <div className={`w-12 h-9 rounded flex items-center justify-center shrink-0 ${getPlatformColor(song.platform)}`}>
                      {getPlatformIcon(song.platform)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-normal leading-tight line-clamp-2">{song.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate leading-tight">{song.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-4 px-3 text-center">
              <p className="text-xs text-muted-foreground">No songs in this playlist</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};