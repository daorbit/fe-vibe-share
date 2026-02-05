import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Button, Empty, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFeedPlaylists, resetFeedPagination, isCacheValid } from "@/store/slices/playlistSlice";
import PlaylistPost, { PlaylistPostData } from "./PlaylistPost";
import { FeedSkeleton, FeedCardSkeleton } from "@/components/skeletons";
import PullToRefresh from "./PullToRefresh";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { triggerHaptic } from "@/hooks/useHaptic";

const { Text } = Typography;

interface FeedPageProps {
  onShareClick: () => void;
  isLoggedIn: boolean;
}

const FeedPage = ({ onShareClick, isLoggedIn }: FeedPageProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { feedPlaylists, isLoading, isLoadingMore, error, feedPage, hasMoreFeed, feedLastFetched } = useAppSelector((state) => state.playlists);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Pull to refresh
  const handlePullRefresh = useCallback(async () => {
    triggerHaptic('medium');
    dispatch(resetFeedPagination());
    await dispatch(fetchFeedPlaylists({ limit: 10, page: 1 })).unwrap();
    triggerHaptic('success');
  }, [dispatch]);

  const {
    containerRef,
    pullDistance,
    isRefreshing,
    progress,
    shouldTrigger,
  } = usePullToRefresh({
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

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMoreFeed && !isLoading && !isLoadingMore) {
      dispatch(fetchFeedPlaylists({ page: feedPage + 1, limit: 10, append: true }));
    }
  }, [dispatch, feedPage, hasMoreFeed, isLoading, isLoadingMore]);

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

  const transformedPlaylists: PlaylistPostData[] = feedPlaylists.map(playlist => {
    
    return {
      id: playlist.id,
      username: playlist.username || playlist.user?.username || 'unknown',
      userAvatar: playlist.userAvatar,
      playlistName: playlist.title,
      playlistCover: playlist.coverGradient,
      coverImage: playlist.thumbnailUrl,
      description: playlist.description,
      songs: playlist.songs.map(song => ({
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail
      })),
      totalSongs: playlist.songCount || playlist.songs.length || 0,
      likes: playlist.likesCount,
      isLiked: playlist.isLiked,
      isSaved: playlist.isSaved,
      createdAt: playlist.createdAt
    };
  });

  return (
    <PullToRefresh
      ref={containerRef}
      pullDistance={pullDistance}
      isRefreshing={isRefreshing}
      progress={progress}
      shouldTrigger={shouldTrigger}
    >
      <div>
        <div className="max-w-lg mx-auto">
          {isLoading && feedPlaylists.length > 0 && (
            <div className="px-4 py-4">
              <FeedCardSkeleton />
            </div>
          )}
          
          {error && (
            <div className="text-center py-12 px-4 animate-fade-in">
              <div className="glass rounded-2xl p-6">
                <Text type="danger" className="block mb-3 text-sm">{error}</Text>
                <Button size="small" onClick={handleRefresh} icon={<RefreshCw className="w-3 h-3" />} className="!rounded-lg !h-8">
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
              <div className="divide-y divide-border/30">
                {transformedPlaylists.map((playlist, index) => (
                  <div 
                    key={playlist.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
                  >
                    <PlaylistPost 
                      {...playlist} 
                      onClick={() => handlePlaylistClick(playlist)}
                    />
                  </div>
                ))}
              </div>
              
              {transformedPlaylists.length === 0 && !isLoading && (
                <Empty
                  className="py-16"
                  description={
                    <div className="mt-2">
                      <Text strong className="block mb-1">No playlists yet</Text>
                      <Text type="secondary" className="text-sm">Be the first to share!</Text>
                    </div>
                  }
                >
                  <Button size="small" onClick={onShareClick} className="!rounded-[8px] px-4 !h-8">
                    Create Playlist
                  </Button>
                </Empty>
              )}
              
              {transformedPlaylists.length > 0 && hasMoreFeed && (
                <div ref={loadMoreRef} className="px-4 py-4">
                  {isLoadingMore && <FeedCardSkeleton />}
                </div>
              )}

              {transformedPlaylists.length > 0 && !hasMoreFeed && (
                <div className="text-center py-8">
                  <Text type="secondary" className="text-sm">You're all caught up!</Text>
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