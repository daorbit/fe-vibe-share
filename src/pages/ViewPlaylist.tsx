/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Share2, MoreHorizontal, Bookmark, ExternalLink, Edit, Link2, Play, Clock, Music2, BookmarkCheck } from "lucide-react";
import { usePlaylist, SongLink } from "@/contexts/PlaylistContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { likePlaylist, unlikePlaylist } from "@/store/slices/playlistSlice";
import { getPlatformColor, getPlatformIcon } from "@/lib/songUtils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useClickSound } from "@/hooks/useClickSound";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Song Card Skeleton Component
const SongCardSkeleton = () => (
  <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <div className="p-3">
      <Skeleton className="h-4 w-16 mb-2 rounded-full" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-3 w-2/3 mb-3" />
      <div className="flex gap-1">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  </div>
);

const ViewPlaylist = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlaylist, savePlaylist, unsavePlaylist, savedPlaylists } = usePlaylist();
  const { playSongs } = usePlayer();
  const { user } = useAppSelector((state) => state.auth);
  const isLoggedIn = !!user;
  const dispatch = useAppDispatch();
  
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const fetchingRef = useRef(false);
  const isSaved = savedPlaylists.some(p => p.id === id);
  const isOwn = playlist?.user?._id === user?.id;
  const { playSound } = useClickSound();

  useEffect(() => {
    if (playlist) {
      setIsLiked(playlist.isLiked || false);
      setLikeCount(playlist.likesCount || 0);
    }
  }, [playlist]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id || fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      try {
        const fetchedPlaylist = await getPlaylist(id);
        setPlaylist(fetchedPlaylist);
      } catch (error) {
        console.error('Failed to fetch playlist:', error);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };
    fetchPlaylist();
  }, [id, getPlaylist]);

  const handlePlaySong = (index: number) => {
    playSound('pop');
    if (playlist) {
      playSongs(playlist.songs, index, playlist.id, playlist.title);
    }
  };

  const handleOpenExternal = (e: React.MouseEvent, song: SongLink) => {
    e.stopPropagation();
    playSound('tap');
    window.open(song.url, "_blank", "noopener,noreferrer");
  };

  const handleShareSong = (e: React.MouseEvent, song: SongLink) => {
    e.stopPropagation();
    playSound('click');
    if (navigator.share) {
      navigator.share({ title: song.title, url: song.url });
    } else {
      navigator.clipboard.writeText(song.url);
      toast.success("Link copied!");
    }
  };

  const handleLike = async () => {
    playSound('pop');
    if (!isLoggedIn) {
      navigate("/sign-in");
      return;
    }

    if (!playlist?.id) return;

    // Optimistic update
    const wasLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);

    try {
      if (wasLiked) {
        await dispatch(unlikePlaylist(playlist.id)).unwrap();
      } else {
        await dispatch(likePlaylist(playlist.id)).unwrap();
      }
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount(prevCount);
      toast.error("Failed to update like");
    }
  };

  const handleSave = () => {
    playSound('pop');
    if (!playlist || !playlist.id) return;
    
    if (!isLoggedIn) {
      navigate("/sign-in");
      return;
    }
    
    if (isSaved) {
      unsavePlaylist(playlist.id);
      toast.success("Removed from saved");
    } else {
      savePlaylist(playlist.id);
      toast.success("Saved to library!");
    }
  };

  const handleShare = () => {
    playSound('click');
    if (!playlist) return;
    
    const shareUrl = `${window.location.origin}/playlist/${id}`;
    
    if (navigator.share) {
      navigator.share({ title: playlist.title, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    }
  };

  const handleEdit = () => {
    playSound('tap');
    navigate(`/playlist/${id}/edit`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (songs: SongLink[]) => {
    const totalSeconds = songs.reduce((acc, song) => acc + (song.duration || 180), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen pb-28">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center justify-between px-4 h-12 max-w-4xl mx-auto">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="flex gap-4 mb-6">
            <Skeleton className="w-28 h-28 md:w-36 md:h-36 rounded-2xl flex-shrink-0" />
            <div className="flex-1 py-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <Skeleton className="h-px w-full mb-4" />
          <div className="flex justify-between mb-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center">
          <Link2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">Playlist not found</p>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-full">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 h-12 max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-sm">Playlist</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              <DropdownMenuItem onClick={handleShare}>Copy Link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Hero Section - No Gradient */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex gap-4">
            {/* Cover */}
            <div className={`w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br ${playlist.coverGradient} flex-shrink-0 overflow-hidden shadow-xl shadow-black/20 ring-1 ring-white/10`}>
              {playlist.thumbnailUrl || playlist.songs[0]?.thumbnail ? (
                <img 
                  src={playlist.thumbnailUrl || playlist.songs[0].thumbnail} 
                  alt={playlist.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="w-10 h-10 text-white/40" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0 py-1">
              <h1 className="text-xl md:text-2xl font-bold mb-1.5 truncate">{playlist.title}</h1>
              
              {/* Creator */}
              <button 
                onClick={() => navigate(`/user/${playlist.user?.username || playlist.username}`)}
                className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
              >
                <UserAvatar 
                  avatarUrl={playlist.userAvatar || playlist.user?.avatarUrl} 
                  size={22} 
                  className="ring-1 ring-border"
                />
                <span className="text-sm text-muted-foreground font-medium">@{playlist.user?.username || playlist.username}</span>
              </button>

              {/* Stats with Duration */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Music2 className="w-3.5 h-3.5" />
                  {playlist.songs.length} songs
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTotalDuration(playlist.songs)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  {likeCount} likes
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {playlist.description && (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
              {playlist.description}
            </p>
          )}

          {/* Tags */}
          {playlist.tags && playlist.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {playlist.tags.map((tag: string) => (
                <span 
                  key={tag} 
                  className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions - Compact inline */}
          <div className="flex items-center gap-1.5 mt-4">
            {isOwn && (
              <Button 
                size="sm" 
                onClick={handleEdit} 
                className="gap-1.5 rounded-full px-3 h-8 text-xs touch-manipulation"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Button>
            )}
            
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1 h-8 px-3 rounded-full text-xs font-medium transition-all duration-300 active:scale-95 touch-manipulation ${
                isLiked 
                  ? "bg-red-500/90 text-white" 
                  : "bg-secondary hover:bg-secondary/80 text-foreground"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 transition-transform ${isLiked ? "fill-current" : ""}`} />
              {likeCount}
            </button>
            
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors touch-manipulation"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            
            {!isOwn && (
              <button
                type="button"
                onClick={handleSave}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 touch-manipulation ${
                  isSaved 
                    ? "bg-primary text-white" 
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-3.5 h-3.5" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 mx-4 mb-4" />

        {/* Songs Grid */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Songs</h2>
            <span className="text-xs text-muted-foreground">{playlist.songs.length} tracks</span>
          </div>

          {playlist.songs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                <Music2 className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">No songs yet</p>
              <p className="text-sm text-muted-foreground/70">This playlist is empty</p>
              {isOwn && (
                <Button className="mt-4 rounded-full" variant="outline" onClick={handleEdit}>
                  Add Songs
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {playlist.songs.map((song: SongLink, index: number) => (
                <button 
                  type="button"
                  key={song.id}
                  className="text-left group bg-card rounded-xl border border-border/40 overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in active:scale-[0.98] touch-manipulation"
                  style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
                  onClick={() => handlePlaySong(index)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square">
                    {song.thumbnail ? (
                      <img 
                        src={song.thumbnail} 
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${getPlatformColor(song.platform)}`}>
                        <span className="text-4xl">{getPlatformIcon(song.platform)}</span>
                      </div>
                    )}
                    
                    {/* Play Button - Show on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-11 h-11 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/30 group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Platform Badge - Top Right */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide ${getPlatformColor(song.platform)}`}>
                        {song.platform}
                      </span>
                    </div>

                    {/* Track Number Badge */}
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{index + 1}</span>
                    </div>

                    {/* Duration Badge */}
                    {song.duration && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                        <span className="text-[10px] font-medium text-white">{formatDuration(song.duration)}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    {/* Title & Artist */}
                    <p className="text-xs font-semibold truncate mb-0.5 group-hover:text-primary transition-colors">
                      {song.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mb-2">{song.artist}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySong(index);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 h-7 rounded-md bg-primary/90 hover:bg-primary text-[11px] font-medium text-primary-foreground transition-colors touch-manipulation"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Play
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleOpenExternal(e, song)}
                        className="w-7 h-7 rounded-md bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleShareSong(e, song)}
                        className="w-7 h-7 rounded-md bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPlaylist;