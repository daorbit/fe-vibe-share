const API_BASE_URL = import.meta.env.PROD
  ? 'https://be-vibeshare.daorbit.in/api'
  : 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('vibe_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth API
export const authAPI = {
  register: async (data: { email: string; username: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  refresh: async (refreshToken: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  googleSignIn: async (credential: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    return handleResponse(response);
  },
};

// Users API
export const usersAPI = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);

    const response = await fetch(`${API_BASE_URL}/users?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUserByUsername: async (username: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${username}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUserById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/id/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateUser: async (id: string, data: { bio?: string; avatarUrl?: string; username?: string; socialLinks?: any }) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getUserPlaylists: async (id: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/users/${id}/playlists?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // NOTE: Follow/following features are not needed in v1
  // getUserFollowers: async (id: string, params?: { page?: number; limit?: number }) => {
  //   const query = new URLSearchParams();
  //   if (params?.page) query.set('page', params.page.toString());
  //   if (params?.limit) query.set('limit', params.limit.toString());

  //   const response = await fetch(`${API_BASE_URL}/users/${id}/followers?${query}`, {
  //     headers: getAuthHeaders(),
  //   });
  //   return handleResponse(response);
  // },

  // getUserFollowing: async (id: string, params?: { page?: number; limit?: number }) => {
  //   const query = new URLSearchParams();
  //   if (params?.page) query.set('page', params.page.toString());
  //   if (params?.limit) query.set('limit', params.limit.toString());

  //   const response = await fetch(`${API_BASE_URL}/users/${id}/following?${query}`, {
  //     headers: getAuthHeaders(),
  //   });
  //   return handleResponse(response);
  // },

  // followUser: async (id: string) => {
  //   const response = await fetch(`${API_BASE_URL}/users/${id}/follow`, {
  //     method: 'POST',
  //     headers: getAuthHeaders(),
  //   });
  //   return handleResponse(response);
  // },

  // unfollowUser: async (id: string) => {
  //   const response = await fetch(`${API_BASE_URL}/users/${id}/follow`, {
  //     method: 'DELETE',
  //     headers: getAuthHeaders(),
  //   });
  //   return handleResponse(response);
  // },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await fetch(`${API_BASE_URL}/users/upload-profile-picture`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },
};

// Playlists API
export const playlistsAPI = {
  getPlaylists: async (params?: { page?: number; limit?: number; user?: string; tag?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.user) query.set('user', params.user);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.sort) query.set('sort', params.sort);

    const response = await fetch(`${API_BASE_URL}/playlists?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createPlaylist: async (data: { title: string; description?: string; tags?: string[]; coverGradient?: string; isPublic?: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getPlaylist: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updatePlaylist: async (id: string, data: { title?: string; description?: string; tags?: string[]; coverGradient?: string; isPublic?: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deletePlaylist: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  likePlaylist: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  unlikePlaylist: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}/like`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  savePlaylist: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  unsavePlaylist: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}/save`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getSavedPlaylists: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/playlists/saved?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPlaylistSongs: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}/songs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  addSong: async (playlistId: string, data: { title: string; artist: string; url: string; platform?: string; thumbnail?: string }) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  addSongs: async (playlistId: string, data: { songs: { title: string; artist: string; url: string; platform?: string; thumbnail?: string }[] }) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/songs/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateSong: async (songId: string, data: { title?: string; artist?: string; url?: string; platform?: string }) => {
    const response = await fetch(`${API_BASE_URL}/playlists/songs/${songId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteSong: async (songId: string) => {
    const response = await fetch(`${API_BASE_URL}/playlists/songs/${songId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  reorderSongs: async (playlistId: string, data: { songs: { id: string; position: number }[] }) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/songs/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  uploadPlaylistThumbnail: async (playlistId: string, file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/thumbnail`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },

  removePlaylistThumbnail: async (playlistId: string) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/thumbnail`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Feed API
export const feedAPI = {
  getFeed: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/feed?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Discover API
export const discoverAPI = {
  getSuggestedUsers: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/discover/users?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTrendingPlaylists: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/discover/playlists?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPlaylistsByTag: async (tag: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/discover/tags/${tag}?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Search API
export const searchAPI = {
  universalSearch: async (params: { q: string; type?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    query.set('q', params.q);
    if (params.type) query.set('type', params.type);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.offset) query.set('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/search?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  searchUsers: async (params: { q: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    query.set('q', params.q);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.offset) query.set('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/search/users?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  searchPlaylists: async (params: { q: string; limit?: number; offset?: number; sort?: string }) => {
    const query = new URLSearchParams();
    query.set('q', params.q);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.offset) query.set('offset', params.offset.toString());
    if (params.sort) query.set('sort', params.sort);

    const response = await fetch(`${API_BASE_URL}/search/playlists?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  searchTags: async (params: { q: string; limit?: number }) => {
    const query = new URLSearchParams();
    query.set('q', params.q);
    if (params.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/search/tags?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getSearchSuggestions: async (params: { q: string }) => {
    const query = new URLSearchParams();
    query.set('q', params.q);

    const response = await fetch(`${API_BASE_URL}/search/suggestions?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTrendingSearches: async (params?: { limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/search/trending?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getRecentSearches: async (params?: { limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/search/recent?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.unreadOnly) query.set('unreadOnly', 'true');

    const response = await fetch(`${API_BASE_URL}/notifications?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  deleteNotification: async (notificationId: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};