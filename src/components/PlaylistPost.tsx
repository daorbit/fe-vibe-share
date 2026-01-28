import { Heart, Share2, Bookmark, MoreHorizontal, Play, Music2, BookmarkCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Dropdown, App } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { likePlaylist, unlikePlaylist, savePlaylist, unsavePlaylist } from "@/store/slices/playlistSlice";
import UserAvatar from "@/components/UserAvatar";
import { triggerHaptic } from "@/hooks/useHaptic";

const { Text } = Typography;

interface Song {
  title: string;
  artist: string;
  thumbnail?: string;
}

export interface PlaylistPostData {
  id: string;
  username: string;
  userAvatar?: string;
  playlistName: string;
  playlistCover: string;
  coverImage?: string;
  description?: string;
  songs: Song[];
  totalSongs: number;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt?: string;
}

interface PlaylistPostProps extends PlaylistPostData {
  onClick: () => void;
}

const PlaylistPost = ({
  id,
  username,
  userAvatar,
  playlistName,
  playlistCover,
  coverImage,
  description,
  songs,
  totalSongs,
  likes,
  isLiked = false,
  isSaved = false,
  onClick,
}: PlaylistPostProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [isSavedState, setIsSavedState] = useState(isSaved);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    setIsLikedState(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setIsSavedState(isSaved);
  }, [isSaved]);

  useEffect(() => {
    setLikeCount(likes);
  }, [likes]);

  const firstSongThumbnail = coverImage;
  const showThumbnail = firstSongThumbnail && !imageError;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    triggerHaptic('light');

    if (!user) {
      navigate("/sign-in");
      return;
    }

    // Optimistic update
    const wasLiked = isLikedState;
    setIsLikedState(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked) {
        await dispatch(unlikePlaylist(id)).unwrap();
      } else {
        await dispatch(likePlaylist(id)).unwrap();
      }
    } catch (error) {
      // Revert on error
      setIsLikedState(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error("Failed to toggle like:", error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;

    triggerHaptic('medium');

    if (!user) {
      navigate("/sign-in");
      return;
    }

    // Optimistic update
    const wasSaved = isSavedState;
    setIsSavedState(!wasSaved);
    message.success(wasSaved ? "Removed from saved" : "Saved to collection");

    try {
      if (wasSaved) {
        await dispatch(unsavePlaylist(id)).unwrap();
      } else {
        await dispatch(savePlaylist(id)).unwrap();
      }
    } catch (error) {
      // Revert on error
      setIsSavedState(wasSaved);
      message.error("Action failed, please try again");
      console.error("Failed to toggle save:", error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    const shareUrl = `${window.location.origin}/playlist/${id}`;
    const shareText = `Check out "${playlistName}" playlist!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: playlistName, text: shareText, url: shareUrl });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      message.success("Link copied to clipboard");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const truncatedDescription = description && description.length > 100 
    ? description.slice(0, 100) + "..." 
    : description;

  const menuItems = [
    { key: 'report', label: 'Report' },
    { key: 'copyLink', label: 'Copy Link' },
  ];

  return (
    <article className="p-4 transition-colors active:bg-secondary/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          type="button"
          className="flex items-center gap-3 group touch-manipulation text-left"
          onClick={() => navigate(`/user/${username}`)}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
            <UserAvatar avatarUrl={userAvatar} size={40} className="relative bg-secondary" />
          </div>
          <div>
            <Text strong className="text-sm block group-hover:text-primary transition-colors">{username}</Text>
            <Text type="secondary" className="text-xs">{totalSongs} songs</Text>
          </div>
        </button>
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <button 
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary active:bg-secondary/80 transition-colors touch-manipulation"
          >
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
        </Dropdown>
      </div>

      {/* Cover */}
      <button 
        type="button"
        className="relative w-full group rounded-2xl overflow-hidden mb-4 touch-manipulation text-left"
        onClick={onClick}
      >
        <div className="aspect-[4/3] w-full">
          {showThumbnail ? (
            <img 
              src={firstSongThumbnail}
              alt={playlistName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Image failed to load:', firstSongThumbnail, e);
                setImageError(true);
              }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${playlistCover} flex items-center justify-center`}>
              <div className="text-center text-white/70">
                <Music2 className="w-16 h-16 mx-auto mb-2" />
                <p className="text-lg font-medium">{totalSongs} songs</p>
              </div>
            </div>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
            <Play className="w-7 h-7 text-background ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Song count */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            {songs.slice(0, 3).map((song, i) => (
              song.thumbnail && (
                <img 
                  key={i}
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-10 h-10 rounded-lg object-cover border-2 border-white/20"
                />
              )
            ))}
            {songs.length > 3 && (
              <div className="w-10 h-10 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-xs font-medium">
                +{songs.length - 3}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Info */}
      <div className="mb-3">
        <h3 className="font-semibold text-base mb-1">{playlistName}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">
            {showFullDescription ? description : truncatedDescription}
            {description.length > 100 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowFullDescription(!showFullDescription); }}
                className="text-primary ml-1 hover:underline"
              >
                {showFullDescription ? "less" : "more"}
              </button>
            )}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-300 touch-manipulation min-h-[44px] ${
              isLikedState 
                ? "bg-red-500/10 text-red-500" 
                : "bg-secondary/80 hover:bg-secondary active:bg-secondary text-muted-foreground hover:text-foreground"
            } ${isLiking ? "opacity-50 scale-95" : "active:scale-95"}`}
          >
            <Heart 
              className={`w-4 h-4 transition-transform duration-300 ${isLikedState ? "fill-current scale-110" : ""}`} 
            />
            <span className="text-sm font-semibold">{formatNumber(likeCount)}</span>
          </button>
          <button 
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/80 hover:bg-secondary active:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95 touch-manipulation"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <button 
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 touch-manipulation ${
            isSavedState 
              ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25" 
              : "bg-secondary/80 hover:bg-secondary active:bg-secondary text-muted-foreground hover:text-foreground"
          } ${isSaving ? "opacity-50 scale-95" : "active:scale-95"}`}
        >
          {isSavedState ? (
            <BookmarkCheck className="w-4 h-4 fill-current" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>
    </article>
  );
};

export default PlaylistPost;