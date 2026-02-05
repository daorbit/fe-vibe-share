import { useState, useRef, useEffect } from "react";
import { Music2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
import { getPlatformColor } from "@/lib/songUtils";

const MiniPlayerBar = () => {
  const navigate = useNavigate();
  const { playerState, getCurrentSong } = usePlayer();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Initialize position to bottom-right
  useEffect(() => {
    const updatePosition = () => {
      const padding = 16;
      const size = 80;
      setPosition({
        x: window.innerWidth - size - padding,
        y: window.innerHeight - size - padding - 80,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      posX: position.x,
      posY: position.y,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    const newX = Math.max(0, Math.min(window.innerWidth - 80, dragStartRef.current.posX + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.posY + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isDragging) return;
    setIsDragging(false);

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - dragStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - dragStartRef.current.y);

    if (deltaX < 5 && deltaY < 5) {
      navigate("/player");
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const newX = Math.max(0, Math.min(window.innerWidth - 80, dragStartRef.current.posX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartRef.current.y);

      if (deltaX < 5 && deltaY < 5) {
        navigate("/player");
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (!playerState) return null;

  const currentSong = getCurrentSong();
  if (!currentSong) return null;

  return (
    <div
      ref={dragRef}
      className="fixed z-50 cursor-grab active:cursor-grabbing select-none"
      style={{
        left: position.x,
        top: position.y,
        touchAction: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Rotating Disc */}
      <div className="relative group">
        {/* Outer Ring with glow */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 p-1 shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform">
          {/* Inner Disc */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-card to-muted border-2 border-primary/40 overflow-hidden relative animate-spin-slow">
            {/* Vinyl grooves effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.3)_31%,transparent_32%,transparent_40%,rgba(0,0,0,0.2)_41%,transparent_42%,transparent_50%,rgba(0,0,0,0.15)_51%,transparent_52%)]" />

            {/* Center Hole */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-background border-2 border-primary/60 z-10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary/80" />
              </div>
            </div>

            {/* Thumbnail or Icon */}
            {currentSong.thumbnail ? (
              <img
                src={currentSong.thumbnail}
                alt=""
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${getPlatformColor(currentSong.platform)}`}>
                <Music2 className="w-8 h-8 text-white/80" />
              </div>
            )}
          </div>
        </div>

        {/* Playing Indicator Bars */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-0.5 bg-background/90 px-2 py-1 rounded-full">
          <div className="w-1 h-2 bg-primary rounded-full animate-music-bar-1"></div>
          <div className="w-1 h-3 bg-primary rounded-full animate-music-bar-2"></div>
          <div className="w-1 h-2 bg-primary rounded-full animate-music-bar-3"></div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayerBar;