import { useState, useEffect } from "react";
import { Link2, Loader2, Music, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { detectPlatform, getPlatformThumbnail, getPlatformColor, getPlatformIcon } from "@/lib/songUtils";
import { SongLink } from "@/contexts/PlaylistContext";

interface AddSongSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (song: Omit<SongLink, "id">) => void;
}

const fetchYouTubeInfo = async (url: string): Promise<{ title: string; author: string } | null> => {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || "",
        author: data.author_name || ""
      };
    }
  } catch (error) {
    console.error("Failed to fetch YouTube info:", error);
  }
  return null;
};

const AddSongSheet = ({ isOpen, onClose, onAdd }: AddSongSheetProps) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [autoFetched, setAutoFetched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setTitle("");
      setArtist("");
      setThumbnail(null);
      setAutoFetched(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!url.trim()) {
        setThumbnail(null);
        return;
      }

      const platform = detectPlatform(url);
      
      // Set thumbnail for supported platforms
      const platformThumbnail = getPlatformThumbnail(url);
      if (platformThumbnail) {
        setThumbnail(platformThumbnail);
      } else {
        setThumbnail(null);
      }
      
      // Auto-fetch info for YouTube
      if (platform === "YouTube" && !autoFetched) {
        setIsFetching(true);
        const info = await fetchYouTubeInfo(url);
        if (info) {
          setTitle(info.title);
          setArtist(info.author);
          setAutoFetched(true);
        }
        setIsFetching(false);
      }
    };

    const debounce = setTimeout(fetchInfo, 500);
    return () => clearTimeout(debounce);
  }, [url, autoFetched]);

  const handleSubmit = () => {
    if (!url.trim() || !title.trim()) return;

    const platform = detectPlatform(url);
    onAdd({
      title: title.trim(),
      artist: artist.trim() || "Unknown Artist",
      url: url.trim(),
      platform,
      thumbnail: thumbnail || undefined,
    });
    onClose();
  };

  const platform = url ? detectPlatform(url) : null;
  const isValid = url.trim() && title.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] animate-in slide-in-from-bottom duration-300">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Compact Bottom Sheet */}
      <div className="relative bg-background rounded-t-2xl border-t border-border/50 shadow-2xl max-w-lg mx-auto">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="font-semibold text-sm">Add Song</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 px-2 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!isValid || isFetching}
              className="h-7 px-3 text-xs rounded-md"
            >
              {isFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
            </Button>
          </div>
        </div>

        {/* Compact Form */}
        <div className="px-4 pb-4 space-y-3">
          {/* URL Input with inline preview */}
          <div className="relative">
            <Input
              placeholder="Paste music link (YouTube, Spotify...)"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setAutoFetched(false);
              }}
              className="h-10 bg-card border-border/50 rounded-lg pl-3 pr-10 text-sm"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isFetching ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : url && platform ? (
                <span className="text-base">{getPlatformIcon(platform)}</span>
              ) : (
                <Link2 className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Inline Preview + Fields Row */}
          <div className="flex gap-3">
            {/* Thumbnail Preview */}
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              {thumbnail ? (
                <img 
                  src={thumbnail} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={() => setThumbnail(null)}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${url ? getPlatformColor(platform || "Other") : ''}`}>
                  {url ? (
                    <span className="text-2xl">{getPlatformIcon(platform || "Other")}</span>
                  ) : (
                    <Music className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              )}
            </div>

            {/* Title & Artist Fields */}
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Song title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 bg-card border-border/50 rounded-md text-sm"
              />
              <Input
                placeholder="Artist (optional)"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="h-9 bg-card border-border/50 rounded-md text-sm"
              />
            </div>
          </div>

          {autoFetched && !isFetching && (
            <div className="flex items-center gap-1.5 text-primary text-xs">
              <CheckCircle2 className="w-3 h-3" />
              Auto-filled from link
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSongSheet;
