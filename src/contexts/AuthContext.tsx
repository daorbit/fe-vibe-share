import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { googleLogin as reduxGoogleLogin } from "../store/slices/authSlice";
import { authAPI } from "../lib/api";

interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  followersCount?: number;
  followingCount?: number;
  playlistCount?: number;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('vibe_token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to get user:', error);
          localStorage.removeItem('vibe_token');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, accessToken, refreshToken } = response.data;

      localStorage.setItem('vibe_token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);

      // Refresh user data to ensure it's up to date
      await refreshUser();

      console.log("[USER_LOGIN]", {
        userId: userData.id,
        email,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      const response = await authAPI.register({ email, username, password });
      const { user: userData, accessToken, refreshToken } = response.data;

      localStorage.setItem('vibe_token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);

      // Refresh user data to ensure it's up to date
      await refreshUser();

      console.log("[USER_REGISTERED]", {
        userId: userData.id,
        username,
        email,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      // Dispatch to Redux store
      const userData = await dispatch(reduxGoogleLogin(credential)).unwrap();
      
      // Also update local context state
      setUser(userData);

      console.log("[USER_GOOGLE_SIGNIN]", {
        userId: userData.id,
        email: userData.email,
        username: userData.username,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    console.log("[USER_LOGOUT]", {
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    localStorage.removeItem('vibe_token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      signup,
      googleLogin,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
