import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, ExternalLink, Music } from "lucide-react";
import { SongLink } from "@/contexts/PlaylistContext";
import { getPlatformColor } from "@/lib/songUtils";

interface SortableSongItemProps {
  song: Omit<SongLink, "id"> & { tempId: string };
  index: number;
  onRemove: () => void;
}

const SortableSongItem = ({ song, index, onRemove }: SortableSongItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-card rounded-xl border border-border/40 group"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Thumbnail */}
      {song.thumbnail ? (
        <img 
          src={song.thumbnail} 
          alt={song.title}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getPlatformColor(song.platform)}`}>
          <Music className="w-4 h-4" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{song.title}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
          <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${getPlatformColor(song.platform)}`}>
            {song.platform}
          </span>
        </div>
      </div>

      {/* Index */}
      <span className="text-xs text-muted-foreground px-2">#{index + 1}</span>

      {/* Actions */}
      <a
        href={song.url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="w-4 h-4" />
      </a>
      <button
        onClick={onRemove}
        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SortableSongItem;
