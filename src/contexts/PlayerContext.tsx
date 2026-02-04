import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { SongLink } from "./PlaylistContext";

interface PlayerState {
  songs: SongLink[];
  currentIndex: number;
  playlistId: string | null;
  playlistTitle: string;
  // Temporary playlist being played (from saved playlists)
  temporarySongs: SongLink[] | null;
  temporaryIndex: number;
  temporaryPlaylistId: string | null;
  temporaryPlaylistTitle: string | null;
}

interface PlayerContextType {
  playerState: PlayerState | null;
  isPlaying: boolean;
  playSongs: (songs: SongLink[], startIndex?: number, playlistId?: string, playlistTitle?: string) => void;
  playTemporarySongs: (songs: SongLink[], startIndex?: number, playlistId?: string, playlistTitle?: string) => void;
  setCurrentIndex: (index: number) => void;
  setTemporaryIndex: (index: number) => void;
  nextSong: () => void;
  prevSong: () => void;
  closePlayer: () => void;
  getCurrentSong: () => SongLink | undefined;
  isPlayingFromTemporary: boolean;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  const playSongs = useCallback((
    songs: SongLink[], 
    startIndex = 0, 
    playlistId?: string,
    playlistTitle = "Now Playing"
  ) => {
    setPlayerState({
      songs,
      currentIndex: startIndex,
      playlistId: playlistId || null,
      playlistTitle,
      temporarySongs: null,
      temporaryIndex: 0,
      temporaryPlaylistId: null,
      temporaryPlaylistTitle: null,
    });
    setIsPlaying(true);
    navigate("/player");
  }, [navigate]);

  const playTemporarySongs = useCallback((
    songs: SongLink[], 
    startIndex = 0, 
    playlistId?: string,
    playlistTitle = "Now Playing"
  ) => {
    setPlayerState(prev => ({
      songs: prev?.songs || [],
      currentIndex: prev?.currentIndex || 0,
      playlistId: prev?.playlistId || null,
      playlistTitle: prev?.playlistTitle || "Queue",
      temporarySongs: songs,
      temporaryIndex: startIndex,
      temporaryPlaylistId: playlistId || null,
      temporaryPlaylistTitle: playlistTitle,
    }));
    setIsPlaying(true);
    navigate("/player");
  }, [navigate]);

  const getCurrentSong = useCallback(() => {
    if (!playerState) return undefined;
    if (playerState.temporarySongs) {
      return playerState.temporarySongs[playerState.temporaryIndex];
    }
    return playerState.songs[playerState.currentIndex];
  }, [playerState]);

  const setCurrentIndex = useCallback((index: number) => {
    setPlayerState(prev => prev ? { 
      ...prev, 
      currentIndex: index,
      temporarySongs: null,
      temporaryIndex: 0,
      temporaryPlaylistId: null,
      temporaryPlaylistTitle: null,
    } : null);
  }, []);

  const setTemporaryIndex = useCallback((index: number) => {
    setPlayerState(prev => prev ? { ...prev, temporaryIndex: index } : null);
  }, []);

  const nextSong = useCallback(() => {
    setPlayerState(prev => {
      if (!prev) return prev;
      
      if (prev.temporarySongs) {
        if (prev.temporaryIndex >= prev.temporarySongs.length - 1) return prev;
        return { ...prev, temporaryIndex: prev.temporaryIndex + 1 };
      }
      
      if (prev.currentIndex >= prev.songs.length - 1) return prev;
      return { ...prev, currentIndex: prev.currentIndex + 1 };
    });
  }, []);

  const prevSong = useCallback(() => {
    setPlayerState(prev => {
      if (!prev) return prev;
      
      if (prev.temporarySongs) {
        if (prev.temporaryIndex <= 0) return prev;
        return { ...prev, temporaryIndex: prev.temporaryIndex - 1 };
      }
      
      if (prev.currentIndex <= 0) return prev;
      return { ...prev, currentIndex: prev.currentIndex - 1 };
    });
  }, []);

  const closePlayer = useCallback(() => {
    setPlayerState(null);
    setIsPlaying(false);
  }, []);

  return (
    <PlayerContext.Provider value={{
      playerState,
      isPlaying,
      playSongs,
      playTemporarySongs,
      setCurrentIndex,
      setTemporaryIndex,
      nextSong,
      prevSong,
      closePlayer,
      getCurrentSong,
      isPlayingFromTemporary: !!playerState?.temporarySongs,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
