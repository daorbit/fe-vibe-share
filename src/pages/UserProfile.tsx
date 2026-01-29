import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Grid3X3, Link2, Users, Share2, Music, Instagram, Twitter, Youtube, UserPlus, MessageCircle } from "lucide-react";
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

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <UserAvatar 
              avatarUrl={displayProfile.avatarUrl} 
              size={100} 
              className="shadow-2xl ring-4 ring-primary/20 ring-offset-4 ring-offset-background" 
            />
            {!isOwnProfile && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Music className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Name & Bio */}
          <h1 className="text-2xl font-bold mb-1">{displayProfile.username}</h1>
          {displayProfile.bio && (
            <p className="text-muted-foreground max-w-xs mx-auto mb-4">{displayProfile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{displayProfile.playlistCount}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Playlists</p>
            </div>
          </div>

          {/* Actions */}
          {isOwnProfile ? (
            <div className="flex gap-3 justify-center">
              <Button variant="outline" className="rounded-full px-6" onClick={() => navigate("/edit-profile")}>
                Edit Profile
              </Button>
              <Button className="rounded-full px-6" onClick={() => navigate("/playlist/create")}>
                Create Playlist
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 justify-center">
              <Button 
                variant={isFollowing ? "outline" : "default"}
                className="rounded-full px-8 gap-2"
                onClick={handleFollow}
              >
                <UserPlus className="w-4 h-4" />
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button variant="outline" className="rounded-full px-6 gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          )}
        </motion.div>

        {/* Social Links */}
        {hasSocialLinks && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-3 mb-8"
          >
            {displayProfile.socialLinks?.instagram && (
              <a 
                href={displayProfile.socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {displayProfile.socialLinks?.twitter && (
              <a 
                href={displayProfile.socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                title="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {displayProfile.socialLinks?.youtube && (
              <a 
                href={displayProfile.socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                title="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
            {displayProfile.socialLinks?.spotify && (
              <a 
                href={displayProfile.socialLinks.spotify} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                title="Spotify"
              >
                <Music className="w-5 h-5" />
              </a>
            )}
            {displayProfile.socialLinks?.website && (
              <a 
                href={displayProfile.socialLinks.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                title="Website"
              >
                <Link2 className="w-5 h-5" />
              </a>
            )}
          </motion.div>
        )}

        {/* Playlists Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground border-b border-border pb-3">
            <Grid3X3 className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wide">Playlists</span>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {userPlaylists.map((playlist, index) => (
                <motion.div 
                  key={playlist.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 bg-secondary">
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
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {playlist.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {playlist.songCount || playlist.songs?.length || 0} songs
                  </p>
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
