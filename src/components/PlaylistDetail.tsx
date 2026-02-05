import { X, Heart, Share2, MoreHorizontal, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaylistData } from "./PlaylistCard";
import { usePlaylist } from "../contexts/PlaylistContext";
import { useAppSelector } from "../store/hooks";
import ShareDrawer from "@/components/ShareDrawer";

interface SongLink {
  title: string;
  artist: string;
  url: string;
  platform: string;
  thumbnail?: string;
}

interface PlaylistDetailProps {
  playlist: PlaylistData;
  onClose: () => void;
}

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getYouTubeThumbnail = (url: string): string | null => {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  return null;
};

const allSongs: SongLink[] = [
  { title: "Die For You", artist: "The Weeknd", url: "https://www.youtube.com/watch?v=mTLQhPFx2nM", platform: "YouTube", thumbnail: "https://img.youtube.com/vi/mTLQhPFx2nM/mqdefault.jpg" },
  { title: "Blinding Lights", artist: "The Weeknd", url: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b", platform: "Spotify" },
  { title: "Save Your Tears", artist: "The Weeknd", url: "https://www.youtube.com/watch?v=XXYlFuWEuKI", platform: "YouTube", thumbnail: "https://img.youtube.com/vi/XXYlFuWEuKI/mqdefault.jpg" },
  { title: "After Hours", artist: "The Weeknd", url: "https://open.spotify.com/track/2p8IUWQDrpjuFltbdgLOag", platform: "Spotify" },
  { title: "Starboy", artist: "The Weeknd", url: "https://www.youtube.com/watch?v=34Na4j8AVgA", platform: "YouTube", thumbnail: "https://img.youtube.com/vi/34Na4j8AVgA/mqdefault.jpg" },
  { title: "The Hills", artist: "The Weeknd", url: "https://soundcloud.com/theweeknd/the-hills", platform: "SoundCloud" },
  { title: "Can't Feel My Face", artist: "The Weeknd", url: "https://www.youtube.com/watch?v=KEI4qSrkPAs", platform: "YouTube", thumbnail: "https://img.youtube.com/vi/KEI4qSrkPAs/mqdefault.jpg" },
  { title: "Often", artist: "The Weeknd", url: "https://open.spotify.com/track/4PhsKqMdgMEUSstTDAmMpg", platform: "Spotify" },
];

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "YouTube": return "bg-red-500/20 text-red-400";
    case "Spotify": return "bg-green-500/20 text-green-400";
    case "SoundCloud": return "bg-orange-500/20 text-orange-400";
    case "Apple Music": return "bg-pink-500/20 text-pink-400";
    default: return "bg-muted text-muted-foreground";
  }
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "YouTube": return "🎬";
    case "Spotify": return "🎵";
    case "SoundCloud": return "☁️";
    case "Apple Music": return "🍎";
    default: return "🔗";
  }
};

const PlaylistDetail = ({ playlist, onClose }: PlaylistDetailProps) => {
  const { likePlaylist, unlikePlaylist, savePlaylist, unsavePlaylist } = usePlaylist();
  const isLoggedIn = useAppSelector((state) => !!state.auth.user);
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(playlist.isLiked || false);
  const [isSaved, setIsSaved] = useState(playlist.isSaved || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: "", url: "", text: "" });

  const handleOpenLink = (song: SongLink, index: number) => {
    console.log("[SONG_LINK_OPENED]", {
      playlistId: playlist.id,
      playlistName: playlist.playlistName,
      songIndex: index,
      songTitle: song.title,
      songArtist: song.artist,
      platform: song.platform,
      url: song.url,
      timestamp: new Date().toISOString(),
    });
    window.open(song.url, "_blank", "noopener,noreferrer");
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      navigate("/sign-in");
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      if (isLiked) {
        await unlikePlaylist(playlist.id);
        setIsLiked(false);
      } else {
        await likePlaylist(playlist.id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      navigate("/sign-in");
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      if (isSaved) {
        await unsavePlaylist(playlist.id);
        setIsSaved(false);
      } else {
        await savePlaylist(playlist.id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;
    const shareText = `Check out "${playlist.playlistName}" by ${playlist.username}`;

    console.log("[PLAYLIST_SHARE]", {
      playlistId: playlist.id,
      playlistName: playlist.playlistName,
      username: playlist.username,
      timestamp: new Date().toISOString(),
    });

    setShareData({
      title: "Share Playlist",
      url: shareUrl,
      text: shareText,
    });
    setShareDrawerOpen(true);
  };

  const handleClose = () => {
    console.log("[PLAYLIST_CLOSED]", {
      playlistId: playlist.id,
      playlistName: playlist.playlistName,
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      <div className="h-full overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
            <button onClick={handleClose} className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h1 className="font-medium">Playlist</h1>
            <button className="p-2 -mr-2 hover:bg-secondary rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Playlist Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Cover */}
            <div className={`w-full md:w-48 aspect-square rounded-xl bg-gradient-to-br ${playlist.playlistCover} flex-shrink-0`} />

            {/* Info */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Playlist</p>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{playlist.playlistName}</h1>
              <p className="text-muted-foreground text-sm mb-4">
                {playlist.description || "A curated collection of song links"}
              </p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <span className="font-medium text-foreground">{playlist.username}</span>
                <span>•</span>
                <span>{playlist.totalSongs} songs</span>
                <span>•</span>
                <span>{playlist.likes.toLocaleString()} likes</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLike}
                  disabled={isLiking}
                  className={isLiked ? "text-red-500 border-red-500/50" : ""}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={isSaved ? "text-foreground" : ""}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Songs List */}
          <div className="space-y-2">
            {allSongs.map((song, index) => (
              <div
                key={index}
                onClick={() => handleOpenLink(song, index)}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer group transition-colors hover:bg-secondary"
              >
                {/* Thumbnail or Platform Icon */}
                {song.thumbnail ? (
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-14 h-14 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className={`w-14 h-14 rounded flex items-center justify-center flex-shrink-0 ${getPlatformColor(song.platform)}`}>
                    <span className="text-xl">{getPlatformIcon(song.platform)}</span>
                  </div>
                )}

                {/* Number */}
                <span className="text-sm text-muted-foreground w-6 text-center">{index + 1}</span>

                {/* Title & Artist */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getPlatformColor(song.platform)}`}>
                      {song.platform}
                    </span>
                  </div>
                </div>

                {/* Open Link */}
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <ShareDrawer
        open={shareDrawerOpen}
        onClose={() => setShareDrawerOpen(false)}
        shareUrl={shareData.url}
        shareTitle={shareData.title}
        shareText={shareData.text}
      />
    </div>
  );
};

export default PlaylistDetail;