import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  searchQuery: string;
  activeTab: string;
  soundEnabled: boolean;
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>;
}

// Load sound preference from localStorage
const loadSoundPreference = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  }
  return true;
};

const initialState: UIState = {
  theme: 'dark',
  sidebarOpen: true,
  searchQuery: '',
  activeTab: 'feed',
  soundEnabled: loadSoundPreference(),
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('soundEnabled', JSON.stringify(action.payload));
      }
    },
    addToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.toasts.push({
        id: Date.now().toString(),
        ...action.payload,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setSearchQuery,
  setActiveTab,
  setSoundEnabled,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;