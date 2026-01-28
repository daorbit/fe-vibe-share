import { createContext, useContext, useState, ReactNode } from "react";
import { useAppSelector } from "../store/hooks";

export interface UserProfile {
  id: string;
  username: string;
  bio: string;
  avatarUrl?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
    website?: string;
  };
  playlistCount: number;
  createdAt: string;
}

interface SocialContextType {
  users: UserProfile[];
  isLoading: boolean;
  getUserProfile: (userId: string) => UserProfile | undefined;
  getUserByUsername: (username: string) => UserProfile | undefined;
  updateUserStats: (userId: string, updates: Partial<UserProfile>) => void;
  refreshSocialData: () => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error("useSocial must be used within a SocialProvider");
  }
  return context;
};

export const SocialProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  // NOTE: Follow/following features are not needed in v1
  // Fetch social data when user logs in
  // useEffect(() => {
  //   if (isLoggedIn && user) {
  //     refreshSocialData();
  //   } else {
  //     setFollowing([]);
  //     setFollowers([]);
  //   }
  // }, [isLoggedIn, user]);

  // NOTE: Follow/following features are not needed in v1
  /*
  const refreshSocialData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [followingRes, followersRes] = await Promise.all([
        usersAPI.getUserFollowing(user.id),
        usersAPI.getUserFollowers(user.id)
      ]);

      const followingUsers = followingRes.data && Array.isArray(followingRes.data.users) ? followingRes.data.users : [];
      const followersUsers = followersRes.data && Array.isArray(followersRes.data.users) ? followersRes.data.users : [];
      
      setFollowing(followingUsers);
      setFollowers(followersUsers);
    } catch (error) {
      console.error('Failed to load social data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    try {
      await usersAPI.followUser(userId);
      // Refresh data to get updated counts
      await refreshSocialData();
      console.log("[USER_FOLLOWED]", { userId, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      await usersAPI.unfollowUser(userId);
      // Refresh data to get updated counts
      await refreshSocialData();
      console.log("[USER_UNFOLLOWED]", { userId, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  const isFollowing = (userId: string) => following.some(u => u.id === userId);

  const getFollowers = (userId: string) => followers;

  const getFollowing = (userId: string) => following;
  */

  const getUserProfile = (userId: string) => users.find(u => u.id === userId);

  const getUserByUsername = (username: string) => 
    users.find(u => u.username.toLowerCase() === username.toLowerCase());

  const updateUserStats = (userId: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    ));
  };

  return (
    <SocialContext.Provider value={{
      users,
      // NOTE: Follow/following features are not needed in v1
      // following: [],
      // followers: [],
      isLoading,
      // NOTE: Follow/following features are not needed in v1
      // followUser: () => Promise.resolve(),
      // unfollowUser: () => Promise.resolve(),
      // isFollowing: () => false,
      getUserProfile,
      getUserByUsername,
      // NOTE: Follow/following features are not needed in v1
      // getFollowers: () => [],
      // getFollowing: () => [],
      updateUserStats,
      refreshSocialData: () => Promise.resolve(),
    }}>
      {children}
    </SocialContext.Provider>
  );
};
