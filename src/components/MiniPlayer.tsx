import { useState, useRef, useEffect } from "react";
import { X, ExternalLink, Maximize2, Minimize2, ChevronUp, ChevronDown, SkipBack, SkipForward, List, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SongLink } from "@/contexts/PlaylistContext";
import { getPlatformColor, getPlatformIcon } from "@/lib/songUtils";

interface MiniPlayerProps {
  songs: SongLink[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
  onClose: () => void;
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

const MiniPlayer = ({ songs, currentIndex, onChangeIndex, onClose }: MiniPlayerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const currentSong = songs[currentIndex];
  const embedUrl = currentSong ? getEmbedUrl(currentSong.url, currentSong.platform) : null;

  // Reset position when expanded
  useEffect(() => {
    if (isExpanded) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isExpanded]);

  const handleOpenExternal = () => {
    if (currentSong) {
      window.open(currentSong.url, "_blank", "noopener,noreferrer");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onChangeIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < songs.length - 1) {
      onChangeIndex(currentIndex + 1);
    }
  };

  // Swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isExpanded) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Drag handling for repositioning
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isExpanded) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isExpanded) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;
    
    // Constrain to viewport
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 200;
    
    setPosition({
      x: Math.max(-maxX / 2, Math.min(maxX / 2, newX)),
      y: Math.max(-maxY, Math.min(100, newY))
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleDragMove(e as unknown as React.MouseEvent);
      const handleMouseUp = () => handleDragEnd();
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove as unknown as EventListener);
      window.addEventListener('touchend', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove as unknown as EventListener);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (!currentSong) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Player */}
      <div 
        ref={playerRef}
        className={cn(
          "fixed z-50 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl transition-all overflow-hidden",
          isExpanded 
            ? "inset-3 md:inset-6 rounded-2xl" 
            : "bottom-24 left-3 right-3 md:left-auto md:right-4 md:bottom-4 md:w-[360px] rounded-2xl",
          isDragging && "transition-none"
        )}
        style={!isExpanded ? { transform: `translate(${position.x}px, ${position.y}px)` } : undefined}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle - Mobile */}
        {!isExpanded && (
          <div 
            className="flex justify-center py-2 cursor-grab active:cursor-grabbing touch-none md:hidden"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <GripHorizontal className="w-6 h-6 text-muted-foreground/50" />
          </div>
        )}

        {/* Header */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-background/50",
          !isExpanded && "md:pt-3"
        )}>
          {/* Drag Handle - Desktop */}
          {!isExpanded && (
            <div 
              className="hidden md:flex cursor-grab active:cursor-grabbing touch-none p-1"
              onMouseDown={handleDragStart}
            >
              <GripHorizontal className="w-4 h-4 text-muted-foreground/50" />
            </div>
          )}
          
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {/* Music Playing Indicator */}
            <div className="flex items-end gap-0.5 h-4 flex-shrink-0">
              <div className="w-0.5 bg-primary rounded-full animate-music-bar-1"></div>
              <div className="w-0.5 bg-primary rounded-full animate-music-bar-2"></div>
              <div className="w-0.5 bg-primary rounded-full animate-music-bar-3"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentSong.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:scale-110 active:scale-95 transition-transform" onClick={() => setShowQueue(!showQueue)}>
              <List className="w-4 h-4" />
            </Button>
 
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:scale-110 active:scale-95 transition-transform" onClick={handleOpenExternal}>
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:scale-110 active:scale-95 transition-transform" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className={cn("flex", isExpanded ? "h-[calc(100%-52px)]" : "flex-col")}>
          {/* Player Content */}
          <div className={cn(
            "bg-black flex-1",
            isExpanded ? "h-full" : "aspect-video",
            showQueue && !isExpanded && "hidden"
          )}>
            {embedUrl ? (
              <iframe                key={currentSong.id || currentIndex}                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={currentSong.title}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 bg-card">
                <p className="text-muted-foreground text-center text-sm">
                  This platform doesn't support in-app playback
                </p>
                <Button size="sm" onClick={handleOpenExternal} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open in {currentSong.platform}
                </Button>
              </div>
            )}
          </div>

          {/* Queue View */}
          {showQueue && (
            <div className={cn(
              "bg-background overflow-auto",
              isExpanded ? "w-80 border-l border-border/30" : "max-h-48"
            )}>
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Queue ({songs.length} songs)
                </p>
                <div className="space-y-0.5">
                  {songs.map((song, index) => (
                    <button
                      key={song.id}
                      onClick={() => onChangeIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all duration-200 hover:scale-[1.02] active:scale-95",
                        index === currentIndex 
                          ? "bg-primary/10 text-primary animate-in slide-in-from-left-2 duration-200" 
                          : "hover:bg-muted/50"
                      )}
                    >
                      {song.thumbnail ? (
                        <img src={song.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className={`w-8 h-8 rounded flex items-center justify-center text-sm ${getPlatformColor(song.platform)}`}>
                          {getPlatformIcon(song.platform)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{song.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">#{index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        {!isExpanded && !showQueue && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/30 bg-background/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="gap-1 hover:scale-105 active:scale-95 transition-transform disabled:hover:scale-100"
            >
              <SkipBack className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Prev</span>
            </Button>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-medium text-primary">{currentIndex + 1}</span>
              <span>/</span>
              <span>{songs.length}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === songs.length - 1}
              className="gap-1 hover:scale-105 active:scale-95 transition-transform disabled:hover:scale-100"
            >
              <span className="hidden sm:inline text-xs">Next</span>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Swipe hint - Mobile */}
        {!isExpanded && !showQueue && (
          <p className="text-center text-[10px] text-muted-foreground/50 pb-2 md:hidden">
            Swipe left/right for next/prev
          </p>
        )}
      </div>
    </>
  );
};

export default MiniPlayer;
