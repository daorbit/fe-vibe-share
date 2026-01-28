import { Heart, Play, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { likePlaylist, unlikePlaylist } from "@/store/slices/playlistSlice";
import UserAvatar from "./UserAvatar";

interface Song {
  title: string;
  artist: string;
  thumbnail?: string;
}

export interface PlaylistData {
  id: string;
  username: string;
  userAvatar?: string;
  verified?: boolean;
  playlistName: string;
  playlistCover: string;
  coverImage?: string;
  description?: string;
  songs: Song[];
  totalSongs: number;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface PlaylistCardProps extends PlaylistData {
  onClick: () => void;
  variant?: 'default' | 'compact';
}

const PlaylistCard = ({
  id,
  username,
  userAvatar,
  playlistName,
  playlistCover,
  coverImage,
  songs,
  totalSongs,
  likes,
  isLiked = false,
  onClick,
  variant = 'default',
}: PlaylistCardProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiking, setIsLiking] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setIsLikedState(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLikeCount(likes);
  }, [likes]);

  const firstSongThumbnail = coverImage || songs[0]?.thumbnail;
  const showThumbnail = firstSongThumbnail && !imageError;

  // Random aspect ratios for masonry effect
  const aspectRatios = ['aspect-square', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-[5/4]'];
  const randomAspect = aspectRatios[id.charCodeAt(0) % aspectRatios.length];

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div 
      onClick={onClick}
      className="masonry-item card-interactive overflow-hidden cursor-pointer group shine"
    >
      {/* Cover */}
      <div className={`relative overflow-hidden ${variant === 'compact' ? 'aspect-square' : randomAspect}`}>
        {showThumbnail ? (
          <img 
            src={firstSongThumbnail}
            alt={playlistName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${playlistCover} flex items-center justify-center`}>
            <Play className="w-12 h-12 text-white/30" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <Play className="w-6 h-6 text-background ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Song count badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium">
          {totalSongs} songs
        </div>

        {/* Like button */}
        <button 
          onClick={handleLike}
          disabled={isLiking}
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isLikedState 
              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30 scale-110" 
              : "bg-black/60 backdrop-blur-md text-white hover:bg-white/20"
          } ${isLiking ? "opacity-50 scale-95" : "active:scale-90"}`}
        >
          <Heart className={`w-4.5 h-4.5 transition-transform duration-300 ${isLikedState ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {playlistName}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <UserAvatar avatarUrl={userAvatar} size={24} />
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">{username}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="w-3 h-3" />
            <span>{formatNumber(likeCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;