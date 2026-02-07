import { cn } from "@/lib/utils";
import { getPlatformColor, getPlatformIcon } from "@/lib/songUtils";
import { SongLink } from "@/contexts/PlaylistContext";

interface QueueItemProps {
  song: SongLink;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  innerRef?: React.Ref<HTMLButtonElement>;
}

const QueueItem = ({
  song,
  index,
  isActive,
  onSelect,
  innerRef,
}: QueueItemProps) => {
  return (
    <button
      ref={innerRef}
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors border-b border-border/10 bg-background",
        isActive ? "bg-primary/10" : "hover:bg-muted/30"
      )}
    >
      <div className="w-5 shrink-0 flex justify-center">
        {isActive ? (
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
            isActive ? "text-foreground" : "text-foreground/80"
          )}
        >
          {song.title}
        </p>
        <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
          {song.artist}
        </p>
      </div>
    </button>
  );
};

export default QueueItem;
