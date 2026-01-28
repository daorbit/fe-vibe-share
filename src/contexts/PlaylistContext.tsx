/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { playlistsAPI, feedAPI, discoverAPI } from "../lib/api";
import { useAppSelector } from "../store/hooks";

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
  user?: {
    id: string;
    username: string;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

interface PlaylistContextType {
  playlists: Playlist[];
  savedPlaylists: Playlist[];
  feedPlaylists: Playlist[];
  discoverPlaylists: Playlist[];
  isLoading: boolean;
  error: string | null;
  createPlaylist: (playlist: Omit<Playlist, "id" | "createdAt" | "updatedAt" | "likesCount" | "songs" | "user">) => Promise<Playlist>;
  updatePlaylist: (id: string, updates: Partial<Omit<Playlist, "id" | "createdAt" | "songs" | "user">>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  getPlaylist: (id: string) => Promise<Playlist>;
  savePlaylist: (id: string) => Promise<void>;
  unsavePlaylist: (id: string) => Promise<void>;
  likePlaylist: (id: string) => Promise<void>;
  unlikePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, song: Omit<SongLink, "id" | "position">) => Promise<void>;
  addSongsToPlaylist: (playlistId: string, songs: Omit<SongLink, "id" | "position">[]) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  updateSongInPlaylist: (playlistId: string, songId: string, updates: Partial<SongLink>) => Promise<void>;
  reorderSongs: (playlistId: string, songs: { id: string; position: number }[]) => Promise<void>;
  refreshPlaylists: () => Promise<void>;
  refreshSavedPlaylists: () => Promise<void>;
  fetchFeedPlaylists: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchDiscoverPlaylists: (params?: { page?: number; limit?: number }) => Promise<void>;
  getUserPlaylists: (userId: string, params?: { page?: number; limit?: number }) => Promise<Playlist[]>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
};

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

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>([]);
  const [feedPlaylists, setFeedPlaylists] = useState<Playlist[]>([]);
  const [discoverPlaylists, setDiscoverPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const isLoggedIn = !!user;

  // Load user's playlists when logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      refreshPlaylists();
      refreshSavedPlaylists();
    } else {
      setPlaylists([]);
      setSavedPlaylists([]);
    }
  }, [isLoggedIn, user]);

  const refreshPlaylists = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await playlistsAPI.getPlaylists({ user: user.id });
      setPlaylists(response.data.playlists.map(transformPlaylist));
    } catch (err) {
      console.error('Failed to load playlists:', err);
      setError('Failed to load playlists');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshSavedPlaylists = useCallback(async () => {
    if (!user) return;

    try {
      const response = await playlistsAPI.getSavedPlaylists({ limit: 50 });
      setSavedPlaylists(response.data.playlists.map(transformPlaylist));
    } catch (err) {
      console.error('Failed to load saved playlists:', err);
      setSavedPlaylists([]);
    }
  }, [user]);

  const fetchFeedPlaylists = useCallback(async (params?: { page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedAPI.getFeed(params);
      setFeedPlaylists(response.data.playlists.map(transformPlaylist));
    } catch (err) {
      console.error('Failed to load feed playlists:', err);
      setError('Failed to load feed playlists');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDiscoverPlaylists = useCallback(async (params?: { page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await discoverAPI.getTrendingPlaylists(params);
      setDiscoverPlaylists(response.data.playlists.map(transformPlaylist));
    } catch (err) {
      console.error('Failed to load discover playlists:', err);
      setError('Failed to load discover playlists');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserPlaylists = useCallback(async (userId: string, params?: { page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await playlistsAPI.getPlaylists({ user: userId, ...params });
      return response.data.playlists.map(transformPlaylist);
    } catch (err) {
      console.error('Failed to load user playlists:', err);
      setError('Failed to load user playlists');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const transformPlaylist = (playlist: any): Playlist => ({
    id: playlist.id || playlist._id,
    title: playlist.title,
    description: playlist.description || '',
    coverGradient: playlist.coverGradient || gradients[Math.floor(Math.random() * gradients.length)],
    thumbnailUrl: playlist.thumbnailUrl,
    songs: (playlist.songs || []).map((song: any) => ({
      id: song.id || song._id,
      title: song.title,
      artist: song.artist,
      url: song.url,
      platform: song.platform,
      thumbnail: song.thumbnail,
      position: song.position,
    })),
    tags: playlist.tags || [],
    likesCount: playlist.likesCount || playlist.likes || 0,
    songCount: playlist.songCount || 0,
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
    isPublic: playlist.isPublic !== false,
    user: playlist.user || playlist.userId,
    isLiked: playlist.isLiked,
    isSaved: playlist.isSaved,
  });

  const createPlaylist = async (playlistData: Omit<Playlist, "id" | "createdAt" | "updatedAt" | "likesCount" | "songs" | "user">): Promise<Playlist> => {
    try {
      setError(null);
      const response = await playlistsAPI.createPlaylist({
        title: playlistData.title,
        description: playlistData.description,
        tags: playlistData.tags,
        coverGradient: playlistData.coverGradient,
        isPublic: playlistData.isPublic,
      });

      const newPlaylist = transformPlaylist(response.data.playlist);
      setPlaylists(prev => [newPlaylist, ...prev]);
      return newPlaylist;
    } catch (err) {
      console.error('Failed to create playlist:', err);
      setError('Failed to create playlist');
      throw err;
    }
  };

  const updatePlaylist = async (id: string, updates: Partial<Omit<Playlist, "id" | "createdAt" | "songs" | "user">>) => {
    try {
      setError(null);
      await playlistsAPI.updatePlaylist(id, {
        title: updates.title,
        description: updates.description,
        tags: updates.tags,
        coverGradient: updates.coverGradient,
        isPublic: updates.isPublic,
      });

      setPlaylists(prev => prev.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ));
    } catch (err) {
      console.error('Failed to update playlist:', err);
      setError('Failed to update playlist');
      throw err;
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      setError(null);
      await playlistsAPI.deletePlaylist(id);
      setPlaylists(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete playlist:', err);
      setError('Failed to delete playlist');
      throw err;
    }
  };

  const getPlaylist = async (id: string): Promise<Playlist> => {
    try {
      setError(null);
      const response = await playlistsAPI.getPlaylist(id);
      return transformPlaylist(response.data.playlist);
    } catch (err) {
      console.error('Failed to get playlist:', err);
      setError('Failed to get playlist');
      throw err;
    }
  };

  const savePlaylist = async (id: string) => {
    try {
      setError(null);
      await playlistsAPI.savePlaylist(id);
      // Update local state
      setPlaylists(prev => prev.map(p =>
        p.id === id ? { ...p, isSaved: true } : p
      ));
    } catch (err) {
      console.error('Failed to save playlist:', err);
      setError('Failed to save playlist');
      throw err;
    }
  };

  const unsavePlaylist = async (id: string) => {
    try {
      setError(null);
      await playlistsAPI.unsavePlaylist(id);
      // Update local state
      setPlaylists(prev => prev.map(p =>
        p.id === id ? { ...p, isSaved: false } : p
      ));
    } catch (err) {
      console.error('Failed to unsave playlist:', err);
      setError('Failed to unsave playlist');
      throw err;
    }
  };

  const likePlaylist = async (id: string) => {
    try {
      setError(null);
      const response = await playlistsAPI.likePlaylist(id);
      // Update local state
      setPlaylists(prev => prev.map(p =>
        p.id === id ? { ...p, isLiked: true, likesCount: response.data.likesCount } : p
      ));
    } catch (err) {
      console.error('Failed to like playlist:', err);
      setError('Failed to like playlist');
      throw err;
    }
  };

  const unlikePlaylist = async (id: string) => {
    try {
      setError(null);
      const response = await playlistsAPI.unlikePlaylist(id);
      // Update local state
      setPlaylists(prev => prev.map(p =>
        p.id === id ? { ...p, isLiked: false, likesCount: response.data.likesCount } : p
      ));
    } catch (err) {
      console.error('Failed to unlike playlist:', err);
      setError('Failed to unlike playlist');
      throw err;
    }
  };

  const addSongToPlaylist = async (playlistId: string, song: Omit<SongLink, "id" | "position">) => {
    try {
      setError(null);
      await playlistsAPI.addSong(playlistId, {
        title: song.title,
        artist: song.artist,
        url: song.url,
        platform: song.platform,
        thumbnail: song.thumbnail,
      });

      // Refresh the playlist to get updated songs
      await refreshPlaylists();
    } catch (err) {
      console.error('Failed to add song:', err);
      setError('Failed to add song');
      throw err;
    }
  };

  const addSongsToPlaylist = async (playlistId: string, songs: Omit<SongLink, "id" | "position">[]) => {
    try {
      setError(null);
      await playlistsAPI.addSongs(playlistId, {
        songs: songs.map(song => ({
          title: song.title,
          artist: song.artist,
          url: song.url,
          platform: song.platform,
          thumbnail: song.thumbnail,
        }))
      });

      // Refresh the playlist to get updated songs
      await refreshPlaylists();
    } catch (err) {
      console.error('Failed to add songs:', err);
      setError('Failed to add songs');
      throw err;
    }
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      setError(null);
      await playlistsAPI.deleteSong(songId);
      // Refresh the playlist to get updated songs
      await refreshPlaylists();
    } catch (err) {
      console.error('Failed to remove song:', err);
      setError('Failed to remove song');
      throw err;
    }
  };

  const updateSongInPlaylist = async (playlistId: string, songId: string, updates: Partial<SongLink>) => {
    try {
      setError(null);
      await playlistsAPI.updateSong(songId, {
        title: updates.title,
        artist: updates.artist,
        url: updates.url,
        platform: updates.platform,
      });
      // Refresh the playlist to get updated songs
      await refreshPlaylists();
    } catch (err) {
      console.error('Failed to update song:', err);
      setError('Failed to update song');
      throw err;
    }
  };

  const reorderSongs = async (playlistId: string, songs: { id: string; position: number }[]) => {
    try {
      setError(null);
      await playlistsAPI.reorderSongs(playlistId, { songs });
      // Refresh the playlist to get updated songs
      await refreshPlaylists();
    } catch (err) {
      console.error('Failed to reorder songs:', err);
      setError('Failed to reorder songs');
      throw err;
    }
  };

  return (
    <PlaylistContext.Provider value={{
      playlists,
      savedPlaylists,
      feedPlaylists,
      discoverPlaylists,
      isLoading,
      error,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      getPlaylist,
      savePlaylist,
      unsavePlaylist,
      likePlaylist,
      unlikePlaylist,
      addSongToPlaylist,
      addSongsToPlaylist,
      removeSongFromPlaylist,
      updateSongInPlaylist,
      reorderSongs,
      refreshPlaylists,
      refreshSavedPlaylists,
      fetchFeedPlaylists,
      fetchDiscoverPlaylists,
      getUserPlaylists
    }}>
      {children}
    </PlaylistContext.Provider>
  );
};
