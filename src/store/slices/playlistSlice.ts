import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { playlistsAPI, feedAPI, discoverAPI } from '../../lib/api';

export interface SongLink {
  id: string;
  title: string;
  artist: string;
  url: string;
  platform: string;
  thumbnail?: string;
  position?: number;
  duration?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverGradient: string;
  thumbnailUrl?: string;
  songs: SongLink[];
  tags: string[];
  likesCount: number;
  songCount?: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  username?: string;
  userAvatar?: string;
  user?: {
    id: string;
    username: string;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

interface PlaylistState {
  userPlaylists: Playlist[];
  savedPlaylists: Playlist[];
  feedPlaylists: Playlist[];
  discoverPlaylists: Playlist[];
  currentPlaylist: Playlist | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  feedPage: number;
  hasMoreFeed: boolean;
  // Cache timestamps to avoid redundant API calls
  userPlaylistsLastFetched: number | null;
  savedPlaylistsLastFetched: number | null;
  feedLastFetched: number | null;
  currentUserId: string | null;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

const gradients = [
  "from-purple-800 to-pink-900",
  "from-red-800 to-orange-900",
  "from-green-800 to-teal-900",
  "from-blue-800 to-indigo-900",
  "from-amber-800 to-rose-900",
  "from-cyan-800 to-blue-900",
  "from-fuchsia-800 to-purple-900",
  "from-emerald-800 to-cyan-900",
];

const initialState: PlaylistState = {
  userPlaylists: [],
  savedPlaylists: [],
  feedPlaylists: [],
  discoverPlaylists: [],
  currentPlaylist: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  feedPage: 1,
  hasMoreFeed: true,
  userPlaylistsLastFetched: null,
  savedPlaylistsLastFetched: null,
  feedLastFetched: null,
  currentUserId: null,
};

// Helper to check if cache is valid
export const isCacheValid = (lastFetched: number | null): boolean => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_DURATION;
};

const transformPlaylist = (playlist: any): Playlist => ({
  id: playlist.id || playlist._id,
  title: playlist.title,
  description: playlist.description || '',
  coverGradient: playlist.coverGradient || gradients[Math.floor(Math.random() * gradients.length)],
  thumbnailUrl: playlist.thumbnailUrl,
  songs: playlist.songs || [],
  tags: playlist.tags || [],
  likesCount: playlist.likesCount || playlist.likes || 0,
  songCount: playlist.songCount || 0,
  createdAt: playlist.createdAt,
  updatedAt: playlist.updatedAt,
  isPublic: playlist.isPublic !== false,
  username: playlist.username,
  userAvatar: playlist.userAvatar,
  user: playlist.user || playlist.userId,
  isLiked: playlist.isLiked,
  isSaved: playlist.isSaved,
});

// Async Thunks
export const fetchUserPlaylists = createAsyncThunk(
  'playlists/fetchUserPlaylists',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await playlistsAPI.getPlaylists({ user: userId });
      return response.data.playlists.map(transformPlaylist);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch playlists');
    }
  }
);

export const fetchSavedPlaylists = createAsyncThunk(
  'playlists/fetchSavedPlaylists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await playlistsAPI.getSavedPlaylists({ limit: 50 });
      return response.data.playlists.map(transformPlaylist);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch saved playlists');
    }
  }
);

export const fetchFeedPlaylists = createAsyncThunk(
  'playlists/fetchFeedPlaylists',
  async (params: { page?: number; limit?: number; append?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const response = await feedAPI.getFeed({ page: params?.page, limit: params?.limit });
      return {
        playlists: response.data.playlists.map(transformPlaylist),
        append: params?.append || false,
        hasMore: response.data.playlists.length >= (params?.limit || 20),
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feed');
    }
  }
);

export const fetchDiscoverPlaylists = createAsyncThunk(
  'playlists/fetchDiscoverPlaylists',
  async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await discoverAPI.getTrendingPlaylists(params);
      return response.data.playlists.map(transformPlaylist);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch discover playlists');
    }
  }
);

export const fetchPlaylistById = createAsyncThunk(
  'playlists/fetchPlaylistById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await playlistsAPI.getPlaylist(id);
      return transformPlaylist(response.data.playlist);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch playlist');
    }
  }
);

export const createPlaylist = createAsyncThunk(
  'playlists/createPlaylist',
  async (data: { title: string; description: string; tags: string[]; coverGradient: string; isPublic: boolean }, { rejectWithValue }) => {
    try {
      const response = await playlistsAPI.createPlaylist(data);
      return transformPlaylist(response.data.playlist);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create playlist');
    }
  }
);

export const updatePlaylist = createAsyncThunk(
  'playlists/updatePlaylist',
  async ({ id, updates }: { id: string; updates: Partial<Playlist> }, { rejectWithValue }) => {
    try {
      await playlistsAPI.updatePlaylist(id, updates);
      return { id, updates };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update playlist');
    }
  }
);

export const deletePlaylist = createAsyncThunk(
  'playlists/deletePlaylist',
  async (id: string, { rejectWithValue }) => {
    try {
      await playlistsAPI.deletePlaylist(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete playlist');
    }
  }
);

export const likePlaylist = createAsyncThunk(
  'playlists/likePlaylist',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await playlistsAPI.likePlaylist(id);
      return { id, likesCount: response.data.likesCount };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like playlist');
    }
  }
);

export const unlikePlaylist = createAsyncThunk(
  'playlists/unlikePlaylist',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await playlistsAPI.unlikePlaylist(id);
      return { id, likesCount: response.data.likesCount };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unlike playlist');
    }
  }
);

export const savePlaylist = createAsyncThunk(
  'playlists/savePlaylist',
  async (id: string, { rejectWithValue }) => {
    try {
      await playlistsAPI.savePlaylist(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save playlist');
    }
  }
);

export const unsavePlaylist = createAsyncThunk(
  'playlists/unsavePlaylist',
  async (id: string, { rejectWithValue }) => {
    try {
      await playlistsAPI.unsavePlaylist(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unsave playlist');
    }
  }
);

export const addSongToPlaylist = createAsyncThunk(
  'playlists/addSongToPlaylist',
  async ({ playlistId, song }: { playlistId: string; song: Omit<SongLink, 'id' | 'position'> }, { rejectWithValue }) => {
    try {
      await playlistsAPI.addSong(playlistId, song);
      return playlistId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add song');
    }
  }
);

const playlistSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPlaylist: (state, action: PayloadAction<Playlist | null>) => {
      state.currentPlaylist = action.payload;
    },
    clearPlaylists: (state) => {
      state.userPlaylists = [];
      state.savedPlaylists = [];
      state.userPlaylistsLastFetched = null;
      state.savedPlaylistsLastFetched = null;
      state.currentUserId = null;
    },
    resetFeedPagination: (state) => {
      state.feedPage = 1;
      state.hasMoreFeed = true;
      state.feedPlaylists = [];
      state.feedLastFetched = null;
    },
    invalidateUserPlaylists: (state) => {
      state.userPlaylistsLastFetched = null;
    },
    invalidateSavedPlaylists: (state) => {
      state.savedPlaylistsLastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Playlists
      .addCase(fetchUserPlaylists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        state.userPlaylists = action.payload;
        state.isLoading = false;
        state.userPlaylistsLastFetched = Date.now();
        state.currentUserId = action.meta.arg;
      })
      .addCase(fetchUserPlaylists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Saved Playlists
      .addCase(fetchSavedPlaylists.fulfilled, (state, action) => {
        state.savedPlaylists = action.payload;
        state.savedPlaylistsLastFetched = Date.now();
      })
      // Fetch Feed Playlists
      .addCase(fetchFeedPlaylists.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchFeedPlaylists.fulfilled, (state, action) => {
        const { playlists, append, hasMore } = action.payload;
        if (append) {
          state.feedPlaylists = [...state.feedPlaylists, ...playlists];
        } else {
          state.feedPlaylists = playlists;
          state.feedPage = 1;
          state.feedLastFetched = Date.now();
        }
        state.hasMoreFeed = hasMore;
        state.feedPage += append ? 1 : 0;
        state.isLoading = false;
        state.isLoadingMore = false;
      })
      .addCase(fetchFeedPlaylists.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload as string;
      })
      // Fetch Discover Playlists
      .addCase(fetchDiscoverPlaylists.fulfilled, (state, action) => {
        state.discoverPlaylists = action.payload;
      })
      // Fetch Playlist By ID
      .addCase(fetchPlaylistById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPlaylistById.fulfilled, (state, action) => {
        state.currentPlaylist = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPlaylistById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Playlist
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.userPlaylists.unshift(action.payload);
      })
      // Update Playlist
      .addCase(updatePlaylist.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        state.userPlaylists = state.userPlaylists.map(p =>
          p.id === id ? { ...p, ...updates } : p
        );
      })
      // Delete Playlist
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.userPlaylists = state.userPlaylists.filter(p => p.id !== action.payload);
      })
      // Like Playlist
      .addCase(likePlaylist.fulfilled, (state, action) => {
        const { id, likesCount } = action.payload;
        const updateLike = (playlist: Playlist) =>
          playlist.id === id ? { ...playlist, isLiked: true, likesCount } : playlist;
        
        state.feedPlaylists = state.feedPlaylists.map(updateLike);
        state.discoverPlaylists = state.discoverPlaylists.map(updateLike);
        state.userPlaylists = state.userPlaylists.map(updateLike);
        if (state.currentPlaylist?.id === id) {
          state.currentPlaylist = { ...state.currentPlaylist, isLiked: true, likesCount };
        }
      })
      // Unlike Playlist
      .addCase(unlikePlaylist.fulfilled, (state, action) => {
        const { id, likesCount } = action.payload;
        const updateUnlike = (playlist: Playlist) =>
          playlist.id === id ? { ...playlist, isLiked: false, likesCount } : playlist;
        
        state.feedPlaylists = state.feedPlaylists.map(updateUnlike);
        state.discoverPlaylists = state.discoverPlaylists.map(updateUnlike);
        state.userPlaylists = state.userPlaylists.map(updateUnlike);
        if (state.currentPlaylist?.id === id) {
          state.currentPlaylist = { ...state.currentPlaylist, isLiked: false, likesCount };
        }
      })
      // Save Playlist
      .addCase(savePlaylist.fulfilled, (state, action) => {
        const id = action.payload;
        const updateSave = (playlist: Playlist) =>
          playlist.id === id ? { ...playlist, isSaved: true } : playlist;
        
        state.feedPlaylists = state.feedPlaylists.map(updateSave);
        state.discoverPlaylists = state.discoverPlaylists.map(updateSave);
        if (state.currentPlaylist?.id === id) {
          state.currentPlaylist = { ...state.currentPlaylist, isSaved: true };
        }
      })
      // Unsave Playlist
      .addCase(unsavePlaylist.fulfilled, (state, action) => {
        const id = action.payload;
        const updateUnsave = (playlist: Playlist) =>
          playlist.id === id ? { ...playlist, isSaved: false } : playlist;
        
        state.feedPlaylists = state.feedPlaylists.map(updateUnsave);
        state.discoverPlaylists = state.discoverPlaylists.map(updateUnsave);
        state.savedPlaylists = state.savedPlaylists.filter(p => p.id !== id);
        if (state.currentPlaylist?.id === id) {
          state.currentPlaylist = { ...state.currentPlaylist, isSaved: false };
        }
      });
  },
});

export const { clearError, setCurrentPlaylist, clearPlaylists, resetFeedPagination, invalidateUserPlaylists, invalidateSavedPlaylists } = playlistSlice.actions;
export default playlistSlice.reducer;