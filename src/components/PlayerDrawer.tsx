import { useState, useEffect, useRef, useCallback } from "react";
import { X, ExternalLink, SkipBack, SkipForward, Pause, Play, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerPortal, DrawerOverlay } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SongLink } from "@/contexts/PlaylistContext";
import { getPlatformColor, getPlatformIcon } from "@/lib/songUtils";

interface PlayerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songs: SongLink[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
}

const getEmbedUrl = (url: string, platform: string): string | null => {
  if (platform === "YouTube") {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0&rel=0&enablejsapi=1`;
      }
    }
  }
  
  if (platform === "Spotify") {
    const match = url.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
    }
  }
  
  return null;
};

const PlayerDrawer = ({ open, onOpenChange, songs, currentIndex, onChangeIndex }: PlayerDrawerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentSong = songs[currentIndex];
  const embedUrl = currentSong ? getEmbedUrl(currentSong.url, currentSong.platform) : null;

  // Auto-advance to next song (simulated - actual detection requires postMessage from embed)
  useEffect(() => {
    if (!open || !currentSong) return;

    // Set up Media Session API for background/lock screen controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist || 'Unknown Artist',
        album: 'Playlist',
        artwork: currentSong.thumbnail ? [
          { src: currentSong.thumbnail, sizes: '512x512', type: 'image/png' }
        ] : []
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (currentIndex > 0) onChangeIndex(currentIndex - 1);
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (currentIndex < songs.length - 1) onChangeIndex(currentIndex + 1);
      });

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      }
    };
  }, [open, currentSong, currentIndex, songs.length, onChangeIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onChangeIndex(currentIndex - 1);
    }
  }, [currentIndex, onChangeIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < songs.length - 1) {
      onChangeIndex(currentIndex + 1);
    }
  }, [currentIndex, songs.length, onChangeIndex]);

  const handleOpenExternal = () => {
    if (currentSong) {
      window.open(currentSong.url, "_blank", "noopener,noreferrer");
    }
  };

  if (!currentSong) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
      <DrawerPortal>
        <DrawerOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-x-0 bottom-0 top-0 z-50 flex flex-col bg-background md:inset-x-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:h-[90vh] md:w-[480px] md:max-h-[800px] md:rounded-2xl md:border md:shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Now Playing Indicator */}
              <div className="flex items-end gap-0.5 h-4 shrink-0">
                <div className="w-0.5 bg-primary rounded-full animate-music-bar-1"></div>
                <div className="w-0.5 bg-primary rounded-full animate-music-bar-2"></div>
                <div className="w-0.5 bg-primary rounded-full animate-music-bar-3"></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{currentSong.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover:bg-muted rounded-full"
                onClick={handleOpenExternal}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover:bg-muted rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Player Area */}
          <div className="w-full aspect-video bg-black shrink-0">
            {embedUrl ? (
              <iframe
                ref={iframeRef}
                key={currentSong.id || currentIndex}
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={currentSong.title}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 bg-gradient-to-b from-muted/50 to-muted">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${getPlatformColor(currentSong.platform)}`}>
                  <Music2 className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{currentSong.title}</p>
                  <p className="text-sm text-muted-foreground">{currentSong.artist}</p>
                </div>
                <p className="text-muted-foreground text-center text-sm max-w-[280px]">
                  This platform doesn't support in-app playback
                </p>
                <Button onClick={handleOpenExternal} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open in {currentSong.platform}
                </Button>
              </div>
            )}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-6 py-4 border-b border-border/50 bg-card/30 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="h-12 w-12 rounded-full hover:bg-muted disabled:opacity-30"
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground">
              {isPlaying ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 ml-1" />
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === songs.length - 1}
              className="h-12 w-12 rounded-full hover:bg-muted disabled:opacity-30"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          {/* Queue List - YouTube Style */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
              <p className="text-sm font-medium">Up Next</p>
              <p className="text-xs text-muted-foreground">
                {currentIndex + 1} of {songs.length}
              </p>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {songs.map((song, index) => (
                  <button
                    key={song.id || index}
                    onClick={() => onChangeIndex(index)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                      index === currentIndex 
                        ? "bg-primary/10 border border-primary/20" 
                        : "hover:bg-muted/50 active:scale-[0.98]"
                    )}
                  >
                    {/* Index / Playing Indicator */}
                    <div className="w-6 shrink-0 flex justify-center">
                      {index === currentIndex ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <div className="w-0.5 bg-primary rounded-full animate-music-bar-1"></div>
                          <div className="w-0.5 bg-primary rounded-full animate-music-bar-2"></div>
                          <div className="w-0.5 bg-primary rounded-full animate-music-bar-3"></div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Thumbnail */}
                    {song.thumbnail ? (
                      <img 
                        src={song.thumbnail} 
                        alt="" 
                        className="w-12 h-12 rounded-lg object-cover shrink-0" 
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getPlatformColor(song.platform)}`}>
                        {getPlatformIcon(song.platform)}
                      </div>
                    )}
                    
                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        index === currentIndex && "text-primary"
                      )}>
                        {song.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {song.artist}
                      </p>
                    </div>
                    
                    {/* Platform Badge */}
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                      {song.platform}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Safe Area Padding for Mobile */}
          <div className="h-safe-area-inset-bottom bg-background shrink-0" />
        </div>
      </DrawerPortal>
    </Drawer>
  );
};

export default PlayerDrawer;
