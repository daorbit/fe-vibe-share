import { Settings, Grid3X3, Bookmark, Share2, LogOut, Plus, Edit3, Instagram, Twitter, Youtube, Music, Link2, RefreshCw, Lock } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout, refreshUser } from "@/store/slices/authSlice";
import { fetchUserPlaylists, fetchSavedPlaylists, isCacheValid, invalidateUserPlaylists, invalidateSavedPlaylists } from "@/store/slices/playlistSlice";
import { Music2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { PlaylistGridSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("playlists");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { 
    userPlaylists, 
    savedPlaylists, 
    isLoading,
    userPlaylistsLastFetched,
    savedPlaylistsLastFetched,
    currentUserId
  } = useAppSelector((state) => state.playlists);
  const isLoggedIn = !!user;

  const publicPlaylists = userPlaylists.filter(p => p.isPublic !== false);
  const privatePlaylists = userPlaylists.filter(p => p.isPublic === false);
  const currentPlaylists = activeTab === "playlists" ? publicPlaylists : activeTab === "private" ? privatePlaylists : savedPlaylists;

  const fetchData = useCallback((force = false) => {
    if (!isLoggedIn || !user?.id) return;
    
    const userChanged = currentUserId !== user.id;
    
    if (force || userChanged || !isCacheValid(userPlaylistsLastFetched)) {
      dispatch(fetchUserPlaylists(user.id));
    }
    
    if (force || !isCacheValid(savedPlaylistsLastFetched)) {
      dispatch(fetchSavedPlaylists());
    }
  }, [isLoggedIn, user?.id, dispatch, userPlaylistsLastFetched, savedPlaylistsLastFetched, currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(refreshUser()).unwrap();
      dispatch(invalidateUserPlaylists());
      dispatch(invalidateSavedPlaylists());
      fetchData(true);
      toast.success("Profile refreshed!");
    } catch (error) {
      toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}/user/${user?.username}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Profile link copied!");
  };

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Logged out");
    navigate("/");
  };

  const handlePlaylistClick = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <UserAvatar avatarUrl={user?.avatarUrl} size={64} className="bg-secondary" />
        <h2 className="text-lg font-semibold">Sign in to see your profile</h2>
        <p className="text-sm text-muted-foreground">Create and manage your playlists</p>
        <button 
          onClick={() => navigate("/sign-in")} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  const socialLinks = [
    { key: 'instagram', icon: Instagram, url: user?.socialLinks?.instagram },
    { key: 'twitter', icon: Twitter, url: user?.socialLinks?.twitter },
    { key: 'youtube', icon: Youtube, url: user?.socialLinks?.youtube },
    { key: 'spotify', icon: Music, url: user?.socialLinks?.spotify },
    { key: 'website', icon: Link2, url: user?.socialLinks?.website },
  ].filter(link => link.url);

  const tabs = [
    { key: "playlists", label: "Public", icon: Grid3X3 },
    { key: "private", label: "Private", icon: Lock, count: privatePlaylists.length },
    { key: "saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-11 max-w-lg mx-auto">
          <span className="font-semibold text-sm">@{user?.username}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="p-2 hover:bg-secondary/80 rounded-full transition-colors"
            >
              <RefreshCw className={cn("w-[18px] h-[18px]", isRefreshing && "animate-spin")} />
            </button>
            <button 
              onClick={handleShareProfile}
              className="p-2 hover:bg-secondary/80 rounded-full transition-colors"
            >
              <Share2 className="w-[18px] h-[18px]" />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-secondary/80 rounded-full transition-colors"
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-secondary/80 rounded-full transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Profile Info */}
        <div className="flex items-start gap-5 mb-5">
          <UserAvatar 
            avatarUrl={user?.avatarUrl} 
            size={80} 
            className="ring-2 ring-border ring-offset-2 ring-offset-background shrink-0" 
          />
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="font-semibold text-base truncate">{user?.username}</h1>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{user?.bio || 'No bio yet'}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm">
                <strong>{publicPlaylists.length}</strong>
                <span className="text-muted-foreground ml-1">playlists</span>
              </span>
              <span className="text-sm">
                <strong>{savedPlaylists.length}</strong>
                <span className="text-muted-foreground ml-1">saved</span>
              </span>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {socialLinks.map(({ key, icon: Icon, url }) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-5">
          <button 
            onClick={() => navigate('/edit-profile')}
            className="flex-1 h-9 px-4 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
          <button 
            onClick={() => navigate('/playlist/create')}
            className="flex-1 h-9 px-4 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-4">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors",
                activeTab === key 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && count > 0 && (
                <span className="text-xs">({count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <PlaylistGridSkeleton count={4} />
        ) : currentPlaylists.length === 0 ? (
          <div className="py-16 text-center">
            <Music2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {activeTab === "playlists" ? "No public playlists yet" : 
               activeTab === "private" ? "No private playlists yet" : 
               "No saved playlists"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {currentPlaylists.map((playlist) => (
              <div 
                key={playlist.id}
                onClick={() => handlePlaylistClick(playlist.id)}
                className="cursor-pointer group"
              >
                <div className="relative aspect-square rounded-[6px] overflow-hidden bg-secondary">
                  {playlist.thumbnailUrl ? (
                    <img 
                      src={playlist.thumbnailUrl} 
                      alt={playlist.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${playlist.coverGradient || 'from-primary/20 to-primary/40'} flex items-center justify-center`}>
                      <Music2 className="w-8 h-8 text-foreground/30" />
                    </div>
                  )}
                  
                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  {/* Playlist details in bottom left */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-semibold text-white truncate mb-0.5">
                      {playlist.title}
                    </p>
                    <p className="text-xs text-white/80">
                      {playlist.songCount || playlist.songs.length} songs
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;