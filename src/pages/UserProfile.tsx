import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Grid3X3, Link2, Users, Share2, Music, Instagram, Twitter, Youtube } from "lucide-react";
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

  const initial = displayProfile.username.charAt(0).toUpperCase();

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
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border/40 p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <UserAvatar avatarUrl={displayProfile.avatarUrl} size={80} className="flex-shrink-0 shadow-lg ring-2 ring-primary/20 ring-offset-2 ring-offset-background" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{displayProfile.username}</h1>
              {displayProfile.bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{displayProfile.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-lg font-bold">{displayProfile.playlistCount}</p>
                  <p className="text-xs text-muted-foreground">Playlists</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6">
            {isOwnProfile ? (
              <>
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate("/edit-profile")}>
                  Edit Profile
                </Button>
                <Button className="flex-1 rounded-xl" onClick={() => navigate("/playlist/create")}>
                  Create Playlist
                </Button>
              </>
            ) : (
              <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Share Profile
              </Button>
            )}
          </div>
        </div>

        {/* Social Links */}
        {displayProfile.socialLinks && Object.values(displayProfile.socialLinks).some(link => link) && (
          <div className="bg-card rounded-2xl border border-border/40 p-6 mt-4">
            <h3 className="text-sm font-semibold mb-4">Social Links</h3>
            <div className="flex flex-wrap gap-3">
              {displayProfile.socialLinks.instagram && (
                <a 
                  href={displayProfile.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {displayProfile.socialLinks.twitter && (
                <a 
                  href={displayProfile.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center"
                  title="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {displayProfile.socialLinks.youtube && (
                <a 
                  href={displayProfile.socialLinks.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center"
                  title="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
 
              {displayProfile.socialLinks.spotify && (
                <a 
                  href={displayProfile.socialLinks.spotify} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center"
                  title="Spotify"
                >
                  <Music className="w-5 h-5" />
                </a>
              )}
              {displayProfile.socialLinks.website && (
                <a 
                  href={displayProfile.socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center"
                  title="Website"
                >
                  <Link2 className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Playlists Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Grid3X3 className="w-4 h-4" />
            <span className="text-sm font-medium">Playlists</span>
          </div>

          {loadingPlaylists ? (
            <PlaylistGridSkeleton count={4} />
          ) : userPlaylists.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <Music className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No playlists yet</p>
              {isOwnProfile && (
                <Button className="mt-4" onClick={() => navigate("/playlist/create")}>
                  Create your first playlist
                </Button>
              )}
            </div>
          ) : (
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {userPlaylists.map((playlist) => (
                <div 
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="break-inside-avoid cursor-pointer group"
                >
                  <div className="bg-card rounded-xl border border-border/40 overflow-hidden hover:border-primary/30 transition-all">
                    <div className={`aspect-square bg-gradient-to-br ${playlist.coverGradient} flex items-center justify-center`}>
                      {playlist.thumbnailUrl || playlist.songs?.[0]?.thumbnail ? (
                        <img 
                          src={playlist.thumbnailUrl || playlist.songs[0].thumbnail} 
                          alt={playlist.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Link2 className="w-10 h-10 text-white/30" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {playlist.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {playlist.songCount || playlist.songs?.length || 0} songs
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
