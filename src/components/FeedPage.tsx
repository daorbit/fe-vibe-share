import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Music2, Play, Bookmark } from "lucide-react";
import { Button, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchFeedPlaylists,
  resetFeedPagination,
  isCacheValid,
} from "@/store/slices/playlistSlice";
import PlaylistPost, { PlaylistPostData } from "./PlaylistPost";
import { FeedSkeleton, FeedCardSkeleton } from "@/components/skeletons";
import PullToRefresh from "./PullToRefresh";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { triggerHaptic } from "@/hooks/useHaptic";
import { useQuery } from "@tanstack/react-query";
import { playlistsAPI } from "@/lib/api";
import { getPlatformColor, getPlatformIcon } from "@/lib/songUtils";
import { usePlayer } from "@/contexts/PlayerContext";

const { Text } = Typography;

interface FeedPageProps {
  onShareClick: () => void;
  isLoggedIn: boolean;
}

const FeedPage = ({ onShareClick, isLoggedIn }: FeedPageProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { playSongs } = usePlayer();
  const {
    feedPlaylists,
    isLoading,
    isLoadingMore,
    error,
    feedPage,
    hasMoreFeed,
    feedLastFetched,
  } = useAppSelector((state) => state.playlists);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch saved songs for stories-like display
  const { data: savedSongsData } = useQuery({
    queryKey: ["saved-songs"],
    queryFn: () => playlistsAPI.getSavedSongs({ limit: 20 }),
    enabled: isLoggedIn,
  });

  const savedSongs = savedSongsData?.data?.songs || [];

  // Pull to refresh
  const handlePullRefresh = useCallback(async () => {
    triggerHaptic("medium");
    dispatch(resetFeedPagination());
    await dispatch(fetchFeedPlaylists({ limit: 10, page: 1 })).unwrap();
    triggerHaptic("success");
  }, [dispatch]);

  const { containerRef, pullDistance, isRefreshing, progress, shouldTrigger } =
    usePullToRefresh({
      onRefresh: handlePullRefresh,
      threshold: 80,
      maxPull: 120,
    });

  // Only fetch if cache is invalid or no data
  useEffect(() => {
    if (feedPlaylists.length === 0 || !isCacheValid(feedLastFetched)) {
      dispatch(fetchFeedPlaylists({ limit: 10, page: 1 }));
    }
  }, [dispatch, feedPlaylists.length, feedLastFetched]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMoreFeed && !isLoading && !isLoadingMore) {
        dispatch(
          fetchFeedPlaylists({ page: feedPage + 1, limit: 10, append: true }),
        );
      }
    },
    [dispatch, feedPage, hasMoreFeed, isLoading, isLoadingMore],
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const handlePlaylistClick = (playlist: PlaylistPostData) => {
    navigate(`/playlist/${playlist.id}`);
  };

  const handleRefresh = () => {
    dispatch(resetFeedPagination());
    dispatch(fetchFeedPlaylists({ limit: 10, page: 1 }));
  };

  const transformedPlaylists: PlaylistPostData[] = feedPlaylists.map(
    (playlist) => {
      return {
        id: playlist.id,
        username: playlist.username || playlist.user?.username || "unknown",
        userAvatar: playlist.userAvatar,
        playlistName: playlist.title,
        playlistCover: playlist.coverGradient,
        coverImage: playlist.thumbnailUrl,
        description: playlist.description,
        songs: playlist.songs.map((song) => ({
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
        })),
        totalSongs: playlist.songCount || playlist.songs.length || 0,
        likes: playlist.likesCount,
        isLiked: playlist.isLiked,
        isSaved: playlist.isSaved,
        createdAt: playlist.createdAt,
      };
    },
  );

  const handleSongPlay = (index: number) => {
    triggerHaptic("light");
    // Convert saved songs to the format expected by player
    const songsForPlayer = savedSongs.map((song: any) => ({
      _id: song._id,
      id: song._id,
      title: song.title,
      artist: song.artist,
      url: song.url,
      platform: song.platform,
      thumbnail: song.thumbnail,
      duration: song.duration,
    }));

    playSongs(songsForPlayer, index, "saved-songs", "Saved Songs");
  };

  return (
    <PullToRefresh
      ref={containerRef}
      pullDistance={pullDistance}
      isRefreshing={isRefreshing}
      progress={progress}
      shouldTrigger={shouldTrigger}
    >
      <div className=" ">
        <div className="max-w-lg mx-auto">
          {/* Saved Songs Stories */}
          {isLoggedIn && savedSongs.length > 0 && (
            <div className="border-b border-border/10 mb-1  py-3">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 px-4 ">
                  {savedSongs.map((song: any, index: number) => (
                    <button
                      key={song._id || index}
                      onClick={() => handleSongPlay(index)}
                      className="flex-shrink-0 flex flex-col items-center gap-2 group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="relative">
                        {/* Gradient Ring */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-primary/70 to-primary/50 p-[2px] group-active:scale-95 transition-transform">
                          <div className="w-full h-full rounded-full bg-background" />
                        </div>

                        {/* Song Thumbnail */}
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-background">
                          {song.thumbnail ? (
                            <img
                              src={song.thumbnail}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center ${getPlatformColor(song.platform)}`}
                            >
                              <span className="text-[10px]">
                                {getPlatformIcon(song.platform)}
                              </span>
                            </div>
                          )}
                          {/* Play overlay on hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="w-3 h-3 text-black fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Song Title */}
                      <span className="text-[10px] text-foreground/80 font-medium max-w-[64px] truncate">
                        {song.title}
                      </span>
                    </button>
                  ))}

                  {/* View All Button */}
                  <button
                    onClick={() => navigate("/saved-songs")}
                    className="flex-shrink-0 flex flex-col items-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-full   to-muted/50 flex items-center justify-center border-2 border-dashed border-border group-hover:border-primary transition-colors group-active:scale-95">
                      <Bookmark className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      View All
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {isLoading && feedPlaylists.length > 0 && (
            <div className="py-3">
              <FeedCardSkeleton />
            </div>
          )}

          {error && (
            <div className="text-center py-16 px-4 animate-fade-in">
              <div className="bg-card rounded-2xl p-8 border border-border/50">
                <Text type="danger" className="block mb-4 text-sm">
                  {error}
                </Text>
                <Button
                  size="small"
                  onClick={handleRefresh}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="!rounded-full !h-9 !px-6"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {isLoading && feedPlaylists.length === 0 && (
            <FeedSkeleton count={3} />
          )}

          {!error && (
            <>
              <div className="divide-y divide-border/10">
                {transformedPlaylists.map((playlist, index) => (
                  <div
                    key={playlist.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
                  >
                    <PlaylistPost
                      {...playlist}
                      onClick={() => handlePlaylistClick(playlist)}
                    />
                  </div>
                ))}
              </div>

              {transformedPlaylists.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <Music2 className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No playlists yet
                  </h3>
                  <Text
                    type="secondary"
                    className="text-sm mb-6 text-center max-w-xs"
                  >
                    Be the first to share amazing music with the community!
                  </Text>
                  <Button
                    size="middle"
                    onClick={onShareClick}
                    className="!rounded-full !h-10 !px-8 !font-medium"
                    type="primary"
                  >
                    Create Playlist
                  </Button>
                </div>
              )}

              {transformedPlaylists.length > 0 && hasMoreFeed && (
                <div ref={loadMoreRef} className="py-3">
                  {isLoadingMore && <FeedCardSkeleton />}
                </div>
              )}

              {transformedPlaylists.length > 0 && !hasMoreFeed && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    <Text type="secondary" className="text-xs font-medium">
                      You're all caught up!
                    </Text>
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

export default FeedPage;
