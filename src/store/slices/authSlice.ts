import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../../lib/api';

export interface User {
  id: string;
  email: string;
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
  followersCount?: number;
  followingCount?: number;
  playlistCount?: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Helper to normalize user shape (ensure `id` exists)
const normalizeUser = (u: any) => {
  if (!u) return null;
  return {
    ...u,
    id: u.id ?? u._id,
  } as User;
};

// Async Thunks
export const initAuth = createAsyncThunk(
  'auth/init',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('vibe_token');
    if (!token) return null;
    
    try {
      const response = await authAPI.getMe();
      return response.data.user;
    } catch (error) {
      localStorage.removeItem('vibe_token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue('Session expired');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login({ email, password });
      const { accessToken, refreshToken } = response.data;
      
      localStorage.setItem('vibe_token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Fetch complete user profile after login to get avatarUrl and all data
      const meResponse = await authAPI.getMe();
      console.log('[LOGIN] User fetched:', meResponse);
      return meResponse.data?.user || meResponse.user;
    } catch (error: any) {
      console.error('[LOGIN] Error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ email, password, username }: { email: string; password: string; username: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register({ email, username, password });
      const { accessToken, refreshToken } = response.data;
      
      localStorage.setItem('vibe_token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Fetch complete user profile after signup to ensure consistency
      const meResponse = await authAPI.getMe();
      console.log('[SIGNUP] User fetched:', meResponse);
      return meResponse.data?.user || meResponse.user;
    } catch (error: any) {
      console.error('[SIGNUP] Error:', error);
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    localStorage.removeItem('vibe_token');
    localStorage.removeItem('refreshToken');
  }
);

export const refreshUser = createAsyncThunk(
  'auth/refreshUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe();
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue('Failed to refresh user');
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (credential: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.googleSignIn(credential);
      const { accessToken, refreshToken } = response.data;
      
      localStorage.setItem('vibe_token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Fetch complete user profile after login
      const meResponse = await authAPI.getMe();
      console.log('[GOOGLE_LOGIN] User fetched:', meResponse);
      return meResponse.data?.user || meResponse.user;
    } catch (error: any) {
      console.error('[GOOGLE_LOGIN] Error:', error);
      return rejectWithValue(error.message || 'Google sign-in failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Init Auth
      .addCase(initAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload as any);
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(initAuth.rejected, (state) => {
        state.user = null;
        state.isLoading = false;
        state.isInitialized = true;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload as any);
        state.isLoading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload as any);
        state.isLoading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      // Refresh User
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload as any);
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload as any);
        state.isLoading = false;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;