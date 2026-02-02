import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Grid3X3, Users, Music } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { usePlaylist, Playlist } from "@/contexts/PlaylistContext";
import { usersAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";
import { UserProfileSkeleton, PlaylistGridSkeleton } from "@/components/skeletons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface UserData {
  id: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
    website?: string;
  };
  playlistCount?: number;
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isLoggedIn = !!currentUser;
  const { playlists, getUserPlaylists } = usePlaylist();
  
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const fetchingPlaylistsRef = useRef(false);
  
  const isOwnProfile = currentUser?.username?.toLowerCase() === username?.toLowerCase();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;
      
      setLoadingUser(true);
      setError(null);
      try {
        const response = await usersAPI.getUserByUsername(username);
        const fetchedUser = response.data.user;
        setUserProfile({
          id: fetchedUser.id || fetchedUser._id,
          username: fetchedUser.username,
          bio: fetchedUser.bio,
          avatarUrl: fetchedUser.avatarUrl,
          socialLinks: fetchedUser.socialLinks,
          playlistCount: fetchedUser.playlistCount || 0,
        });
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('User not found');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [username]);

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      if (!userProfile || fetchingPlaylistsRef.current) return;
      
      fetchingPlaylistsRef.current = true;
      setLoadingPlaylists(true);
      try {
        const fetchedPlaylists = await getUserPlaylists(userProfile.id, { limit: 20 });
        setUserPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error('Failed to fetch user playlists:', error);
      } finally {
        setLoadingPlaylists(false);
        fetchingPlaylistsRef.current = false;
      }
    };

    if (userProfile) {
      if (isOwnProfile) {
        setUserPlaylists(playlists);
      } else {
        fetchUserPlaylists();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id, isOwnProfile, playlists, getUserPlaylists]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/user/${username}`;
    if (navigator.share) {
      navigator.share({ title: `@${username}`, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Profile link copied!");
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "Unfollowed" : "Following!");
  };

  if (loadingUser) {
    return <UserProfileSkeleton />;
  }

  if (error || (!userProfile && !isOwnProfile)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-10 h-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">{error || "User not found"}</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  const displayProfile = isOwnProfile 
    ? { 
        id: currentUser?.id || "1",
        username: currentUser?.username || "",
        bio: currentUser?.bio || "",
        avatarUrl: currentUser?.avatarUrl || "",
        socialLinks: currentUser?.socialLinks || {},
        playlistCount: playlists.length,
      }
    : userProfile!;

  const hasSocialLinks = displayProfile.socialLinks && Object.values(displayProfile.socialLinks).some(link => link);

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold">@{displayProfile.username}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>Share Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Profile Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Avatar */}
          <div className="relative inline-block mb-5">
            <UserAvatar 
              avatarUrl={displayProfile.avatarUrl} 
              size={96} 
              className="ring-[3px] ring-primary/60" 
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Music className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </div>

          {/* Name & Bio */}
          <h1 className="text-xl font-bold mb-1">{displayProfile.username}</h1>
          {displayProfile.bio && (
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-5">{displayProfile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <p className="text-lg font-bold">{userPlaylists.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Playlists</p>
            </div>
          </div>

          {/* Actions - Only for own profile */}
          {isOwnProfile && (
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" className="rounded-full px-5 h-9" onClick={() => navigate("/edit-profile")}>
                Edit Profile
              </Button>
              <Button size="sm" className="rounded-full px-5 h-9" onClick={() => navigate("/playlist/create")}>
                Create Playlist
              </Button>
            </div>
          )}
        </motion.div>

        {/* Playlists Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 text-muted-foreground border-t border-border pt-4 mb-4">
            <Grid3X3 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Playlists</span>
          </div>

          {loadingPlaylists ? (
            <PlaylistGridSkeleton count={4} />
          ) : userPlaylists.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Music className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No playlists yet</p>
              {isOwnProfile && (
                <Button className="mt-4 rounded-full" onClick={() => navigate("/playlist/create")}>
                  Create your first playlist
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {userPlaylists.map((playlist, index) => (
                <motion.div 
                  key={playlist.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="relative aspect-square rounded-[6px] overflow-hidden bg-secondary">
                    {playlist.thumbnailUrl || playlist.songs?.[0]?.thumbnail ? (
                      <img 
                        src={playlist.thumbnailUrl || playlist.songs[0].thumbnail} 
                        alt={playlist.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${playlist.coverGradient || 'from-primary/50 to-accent/50'} flex items-center justify-center`}>
                        <Music className="w-10 h-10 text-white/50" />
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
                        {playlist.songCount || playlist.songs?.length || 0} songs
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
