import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  ExternalLink,
  Music2,
  List,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/contexts/PlayerContext";
import { getPlatformColor, getPlatformIcon } from "@/lib/songUtils";
import { PlaylistsTab } from "@/components/player/PlaylistsTab";

const getEmbedUrl = (url: string, platform: string): string | null => {
  if (platform === "YouTube") {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0&rel=0&enablejsapi=1&controls=1&modestbranding=1`;
      }
    }
  }

  if (platform === "Spotify") {
    const match = url.match(
      /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/,
    );
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
    }
  }

  return null;
};

const Player = () => {
  const navigate = useNavigate();
  const {
    playerState,
    setCurrentIndex,
    setTemporaryIndex,
    nextSong,
    prevSong,
    closePlayer,
    playTemporarySongs,
    getCurrentSong,
    isPlayingFromTemporary,
  } = usePlayer();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentSongRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState("queue");
  const prevTabRef = useRef(activeTab);

  const currentSong = getCurrentSong();
  const embedUrl = currentSong
    ? getEmbedUrl(currentSong.url, currentSong.platform)
    : null;

  // Scroll to current song helper
  const scrollToCurrentSong = useCallback(() => {
    if (!currentSongRef.current) return;
    setTimeout(() => {
      currentSongRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }, []);

  // Scroll when switching back to queue tab
  useEffect(() => {
    if (activeTab === "queue" && prevTabRef.current !== "queue") {
      scrollToCurrentSong();
    }
    prevTabRef.current = activeTab;
  }, [activeTab, scrollToCurrentSong]);

  // Scroll when current song changes
  useEffect(() => {
    if (activeTab === "queue") {
      scrollToCurrentSong();
    }
  }, [playerState?.currentIndex, scrollToCurrentSong, activeTab]);

  // Listen for YouTube postMessage events for auto-advance
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === "https://www.youtube.com") {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (data?.event === "onStateChange" && data?.info === 0) {
            nextSong();
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [nextSong]);

  // Media Session API for background/lock screen controls
  useEffect(() => {
    if (!playerState || !currentSong) return;

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist || "Unknown Artist",
        album: playerState.playlistTitle,
        artwork: currentSong.thumbnail
          ? [
              {
                src: currentSong.thumbnail,
                sizes: "512x512",
                type: "image/png",
              },
            ]
          : [],
      });

      navigator.mediaSession.setActionHandler("previoustrack", prevSong);
      navigator.mediaSession.setActionHandler("nexttrack", nextSong);
    }

    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      }
    };
  }, [currentSong, prevSong, nextSong, playerState?.playlistTitle]);

  const handleOpenExternal = () => {
    if (currentSong) {
      window.open(currentSong.url, "_blank", "noopener,noreferrer");
    }
  };

  if (!playerState) {
    navigate("/");
    return null;
  }

  return (
    <div className="max-w-lg mx-auto h-screen bg-background flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/50 shrink-0"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-end gap-[2px] h-3 shrink-0">
            <div className="w-[3px] bg-primary rounded-sm animate-music-bar-1"></div>
            <div className="w-[3px] bg-primary rounded-sm animate-music-bar-2"></div>
            <div className="w-[3px] bg-primary rounded-sm animate-music-bar-3"></div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate leading-tight">
              {currentSong?.title}
            </p>
            <p className="text-xs text-muted-foreground truncate leading-tight">
              {currentSong?.artist}
            </p>
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/50"
            onClick={handleOpenExternal}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Player Area */}
      <div className="w-full aspect-video bg-black shrink-0">
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            key={currentSong?.id || playerState.currentIndex}
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={currentSong?.title}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 bg-gradient-to-b from-card to-muted">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center ${currentSong ? getPlatformColor(currentSong.platform) : "bg-muted"}`}
            >
              <Music2 className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">{currentSong?.title}</p>
              <p className="text-xs text-muted-foreground">
                {currentSong?.artist}
              </p>
            </div>
            <p className="text-muted-foreground text-center text-xs max-w-[240px]">
              This platform doesn't support in-app playback
            </p>
            <Button
              size="sm"
              onClick={handleOpenExternal}
              className="gap-1.5 h-8 text-xs"
            >
              <ExternalLink className="w-3 h-3" />
              Open in {currentSong?.platform}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs: Queue | Playlists */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full grid grid-cols-2 bg-muted/30 border-y border-border/20 rounded-none h-10 shrink-0">
            <TabsTrigger
              value="queue"
              className="text-xs gap-1.5 data-[state=active]:bg-background"
            >
              <List className="w-3.5 h-3.5" />
              Queue
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="text-xs gap-1.5 data-[state=active]:bg-background"
            >
              <Music2 className="w-3.5 h-3.5" />
              Saved Playlists
            </TabsTrigger>
          </TabsList>

          {/* Queue Tab */}
          <TabsContent value="queue" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              {/* Now Playing from Temporary Playlist */}
              {isPlayingFromTemporary && playerState.temporarySongs && (
                <div className="border-b-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
                  <div className="px-3 py-2 border-b border-border/30">
                    <p className="text-xs font-medium text-primary">
                      Now Playing from: {playerState.temporaryPlaylistTitle}
                    </p>
                  </div>
                  <div className="bg-primary/10">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-left"
                      disabled
                    >
                      <div className="w-5 shrink-0 flex justify-center">
                        <div className="flex items-center gap-[2px]">
                          <div className="w-[2px] h-2 bg-primary rounded-sm animate-music-bar-1"></div>
                          <div className="w-[2px] h-2 bg-primary rounded-sm animate-music-bar-2"></div>
                          <div className="w-[2px] h-2 bg-primary rounded-sm animate-music-bar-3"></div>
                        </div>
                      </div>
                      {playerState.temporarySongs[playerState.temporaryIndex].thumbnail ? (
                        <img
                          src={playerState.temporarySongs[playerState.temporaryIndex].thumbnail}
                          alt=""
                          className="w-12 h-9 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-12 h-9 rounded flex items-center justify-center shrink-0 ${getPlatformColor(playerState.temporarySongs[playerState.temporaryIndex].platform)}`}
                        >
                          {getPlatformIcon(playerState.temporarySongs[playerState.temporaryIndex].platform)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-normal leading-tight line-clamp-2 text-foreground">
                          {playerState.temporarySongs[playerState.temporaryIndex].title}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                          {playerState.temporarySongs[playerState.temporaryIndex].artist}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Original Queue */}
              <div className={cn(isPlayingFromTemporary && "opacity-60")}>
                {isPlayingFromTemporary && (
                  <div className="px-3 py-2 border-b border-border/30 bg-muted/30">
                    <p className="text-xs font-medium">Your Queue</p>
                    <p className="text-[10px] text-muted-foreground">
                      Click any song to return to your queue
                    </p>
                  </div>
                )}
                {playerState.songs.map((song, index) => (
                  <button
                    ref={index === playerState.currentIndex && !isPlayingFromTemporary ? currentSongRef : null}
                    key={song.id || index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors border-b border-border/10",
                      index === playerState.currentIndex && !isPlayingFromTemporary
                        ? "bg-primary/10"
                        : "hover:bg-muted/30",
                    )}
                  >
                    <div className="w-5 shrink-0 flex justify-center">
                      {index === playerState.currentIndex && !isPlayingFromTemporary ? (
                        <div className="flex items-center gap-[2px]">
                          <div className="w-[2px] h-2 bg-primary rounded-sm animate-music-bar-1"></div>
                          <div className="w-[2px] h-2 bg-primary rounded-sm animate-music-bar-2"></div>
                          <div className="w-[2px] h-2 bg-primary rounded-sm animate-music-bar-3"></div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    {song.thumbnail ? (
                      <img
                        src={song.thumbnail}
                        alt=""
                        className="w-12 h-9 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-12 h-9 rounded flex items-center justify-center shrink-0 ${getPlatformColor(song.platform)}`}
                      >
                        {getPlatformIcon(song.platform)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs font-normal leading-tight line-clamp-2",
                          index === playerState.currentIndex && !isPlayingFromTemporary
                            ? "text-foreground"
                            : "text-foreground/80",
                        )}
                      >
                        {song.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                        {song.artist}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="flex-1 mt-0 overflow-hidden">
            <PlaylistsTab
              onPlayPlaylist={(songs, startIndex, playlistId, playlistTitle) => {
                playTemporarySongs(songs, startIndex, playlistId, playlistTitle);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Player;