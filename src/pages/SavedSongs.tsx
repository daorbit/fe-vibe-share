import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music2, ArrowLeft, Play, MoreVertical, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { playlistsAPI } from "@/lib/api";
import { getPlatformColor, getPlatformIcon } from "@/lib/songUtils";
import { useAppSelector } from "@/store/hooks";
import { message, Modal } from "antd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SavedSongs = () => {
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => !!state.auth.user);
  const queryClient = useQueryClient();

  const { data: savedSongsData, isLoading } = useQuery({
    queryKey: ["saved-songs"],
    queryFn: () => playlistsAPI.getSavedSongs({ limit: 100 }),
    enabled: isLoggedIn,
  });

  const unsaveMutation = useMutation({
    mutationFn: (songId: string) => playlistsAPI.unsaveSong(songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-songs"] });
      message.success("Song removed from saved");
    },
    onError: () => {
      message.error("Failed to remove song");
    },
  });

  const handleUnsave = (songId: string, songTitle: string) => {
    Modal.confirm({
      title: "Remove Saved Song",
      content: `Remove "${songTitle}" from your saved songs?`,
      okText: "Remove",
      okButtonProps: { danger: true },
      onOk: () => unsaveMutation.mutate(songId),
    });
  };

  const handlePlaySong = (url: string, title: string) => {
    console.log("[SAVED_SONG_PLAYED]", { title, url, timestamp: new Date().toISOString() });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isLoggedIn) {
    navigate("/sign-in");
    return null;
  }

  const songs = savedSongsData?.data?.songs || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Saved Songs</h1>
            <p className="text-xs text-muted-foreground">
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="p-4">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoading && songs.length > 0 && (
            <div className="space-y-2">
              {songs?.map((song: any) => {
                const playlistInfo = song?.playlistInfo;

                return (
                  <div
                    key={song._id}
                    className="border border-border/30 rounded-lg overflow-hidden bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex items-center gap-3 p-3">
                      {song?.thumbnail ? (
                        <img
                          src={song?.thumbnail}
                          alt=""
                          className="w-16 h-12 rounded object-cover shrink-0 cursor-pointer"
                          onClick={() => handlePlaySong(song.url, song.title)}
                        />
                      ) : (
                        <div
                          className={`w-16 h-12 rounded flex items-center justify-center shrink-0 text-lg cursor-pointer ${getPlatformColor(song?.platform)}`}
                          onClick={() => handlePlaySong(song?.url, song?.title)}
                        >
                          {getPlatformIcon(song?.platform)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight line-clamp-2 mb-1">
                          {song?.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate leading-tight">
                          {song?.artist}
                        </p>
                        {playlistInfo?.id && (
                          <button
                            onClick={() => navigate(`/playlist/${playlistInfo.id}`)}
                            className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                          >
                            From: {playlistInfo.title}
                          </button>
                        )}
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 shrink-0"
                        onClick={() => handlePlaySong(song.url, song.title)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 shrink-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleUnsave(song._id, song.title)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove from Saved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && songs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Music2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2">No saved songs yet</h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Save individual songs from playlists and access them here anytime
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SavedSongs;
