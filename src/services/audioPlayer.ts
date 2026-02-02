/**
 * Global Audio Player Service with Media Session API support
 * Handles background playback on mobile devices
 */

import { SongLink } from "@/contexts/PlaylistContext";

export interface AudioPlayerState {
  currentSong: SongLink | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: SongLink[];
  currentIndex: number;
}

type AudioPlayerListener = (state: AudioPlayerState) => void;

class AudioPlayerService {
  private audioElement: HTMLAudioElement | null = null;
  private currentSong: SongLink | null = null;
  private playlist: SongLink[] = [];
  private currentIndex: number = 0;
  private listeners: Set<AudioPlayerListener> = new Set();
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private volume: number = 1;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
      this.setupMediaSession();
    }
  }

  private initAudioElement() {
    // Create a global audio element
    this.audioElement = document.createElement('audio');
    this.audioElement.preload = 'metadata';
    
    // Set attributes for background playback on mobile
    this.audioElement.setAttribute('playsinline', 'true');
    this.audioElement.setAttribute('x-webkit-airplay', 'allow');
    
    // Prevent audio from being paused when screen locks on iOS
    this.audioElement.setAttribute('webkit-playsinline', 'true');
    
    // Allow background audio playback
    this.audioElement.crossOrigin = 'anonymous';
    
    // Event listeners
    this.audioElement.addEventListener('play', this.handlePlay);
    this.audioElement.addEventListener('pause', this.handlePause);
    this.audioElement.addEventListener('ended', this.handleEnded);
    this.audioElement.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audioElement.addEventListener('durationchange', this.handleDurationChange);
    this.audioElement.addEventListener('volumechange', this.handleVolumeChange);
    this.audioElement.addEventListener('error', this.handleError);
    this.audioElement.addEventListener('loadedmetadata', this.handleLoadedMetadata);
    
    // Prevent screen lock from pausing audio
    this.audioElement.addEventListener('suspend', this.handleSuspend);
    this.audioElement.addEventListener('stalled', this.handleStalled);
    
    // Append to body (hidden)
    this.audioElement.style.display = 'none';
    document.body.appendChild(this.audioElement);
    
    // Prevent page visibility changes from affecting playback
    this.setupVisibilityHandling();
    
    this.isInitialized = true;
  }

  private setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.previous();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.next();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(Math.max(0, this.currentTime - skipTime));
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(Math.min(this.duration, this.currentTime + skipTime));
      });
    }
  }

  private setupVisibilityHandling() {
    // Prevent page visibility changes from pausing audio
    document.addEventListener('visibilitychange', () => {
      // Don't do anything - let audio continue playing
      // This prevents mobile browsers from pausing when minimized
      if (document.hidden && this.isPlaying) {
        console.log('Page hidden, audio continues playing');
      }
    });

    // Handle page freeze/resume (mobile Safari)
    window.addEventListener('pagehide', () => {
      // Don't pause - let it continue
      console.log('Page hiding, maintaining playback');
    });

    window.addEventListener('pageshow', () => {
      // Resume if was playing
      if (this.isPlaying && this.audioElement?.paused) {
        this.audioElement.play().catch(e => console.log('Resume failed:', e));
      }
    });
  }

  private handleSuspend = () => {
    // Audio suspended (network issue or mobile optimization)
    // Try to resume if we were playing
    if (this.isPlaying && this.audioElement) {
      console.log('Audio suspended, attempting to resume');
      setTimeout(() => {
        if (this.audioElement?.paused && this.isPlaying) {
          this.audioElement.play().catch(e => console.log('Resume from suspend failed:', e));
        }
      }, 100);
    }
  };

  private handleStalled = () => {
    // Network stalled
    console.log('Audio stalled');
  };

  private updateMediaSessionMetadata() {
    if ('mediaSession' in navigator && this.currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.currentSong.title,
        artist: this.currentSong.artist,
        album: 'vibecheck',
        artwork: this.currentSong.thumbnail ? [
          { src: this.currentSong.thumbnail, sizes: '96x96', type: 'image/jpeg' },
          { src: this.currentSong.thumbnail, sizes: '128x128', type: 'image/jpeg' },
          { src: this.currentSong.thumbnail, sizes: '192x192', type: 'image/jpeg' },
          { src: this.currentSong.thumbnail, sizes: '256x256', type: 'image/jpeg' },
          { src: this.currentSong.thumbnail, sizes: '384x384', type: 'image/jpeg' },
          { src: this.currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' },
        ] : []
      });

      // Update position state
      if (this.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: this.duration,
          playbackRate: this.audioElement?.playbackRate || 1,
          position: this.currentTime
        });
      }
    }
  }

  // Get direct audio URL from platform links
  private getAudioUrl(song: SongLink): string | null {
    // For now, we can only play direct audio URLs
    // YouTube, Spotify etc. require their embedded players
    // This is a placeholder - in production, you'd need a backend to extract audio URLs
    
    // Check if it's a direct audio URL
    const url = song.url.toLowerCase();
    if (url.endsWith('.mp3') || url.endsWith('.ogg') || url.endsWith('.wav') || url.endsWith('.m4a')) {
      return song.url;
    }
    
    // For streaming services, we need to use their iframes
    // Return null to indicate iframe usage needed
    return null;
  }

  private handlePlay = () => {
    this.isPlaying = true;
    this.updateMediaSessionMetadata();
    this.notifyListeners();
  };

  private handlePause = () => {
    this.isPlaying = false;
    this.notifyListeners();
  };

  private handleEnded = () => {
    this.isPlaying = false;
    this.next(); // Auto-play next song
  };

  private handleTimeUpdate = () => {
    if (this.audioElement) {
      this.currentTime = this.audioElement.currentTime;
      this.notifyListeners();
      
      // Update position state periodically
      if ('mediaSession' in navigator && this.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: this.duration,
          playbackRate: this.audioElement.playbackRate,
          position: this.currentTime
        });
      }
    }
  };

  private handleDurationChange = () => {
    if (this.audioElement) {
      this.duration = this.audioElement.duration;
      this.notifyListeners();
      this.updateMediaSessionMetadata();
    }
  };

  private handleVolumeChange = () => {
    if (this.audioElement) {
      this.volume = this.audioElement.volume;
      this.notifyListeners();
    }
  };

  private handleError = (e: Event) => {
    console.error('Audio playback error:', e);
    this.isPlaying = false;
    this.notifyListeners();
  };

  private handleLoadedMetadata = () => {
    if (this.audioElement) {
      this.duration = this.audioElement.duration;
      this.updateMediaSessionMetadata();
      this.notifyListeners();
    }
  };

  private notifyListeners() {
    const state: AudioPlayerState = {
      currentSong: this.currentSong,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      playlist: this.playlist,
      currentIndex: this.currentIndex
    };

    this.listeners.forEach(listener => listener(state));
  }

  // Public API
  subscribe(listener: AudioPlayerListener): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.getState());
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): AudioPlayerState {
    return {
      currentSong: this.currentSong,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      playlist: this.playlist,
      currentIndex: this.currentIndex
    };
  }

  setPlaylist(songs: SongLink[], startIndex: number = 0) {
    this.playlist = songs;
    this.currentIndex = startIndex;
    
    if (songs.length > 0) {
      this.loadSong(songs[startIndex]);
    }
  }

  private loadSong(song: SongLink) {
    this.currentSong = song;
    const audioUrl = this.getAudioUrl(song);
    
    if (audioUrl && this.audioElement) {
      this.audioElement.src = audioUrl;
      this.audioElement.load();
      this.updateMediaSessionMetadata();
    }
    
    this.notifyListeners();
  }

  async play() {
    if (!this.audioElement || !this.currentSong) return;

    try {
      // Request audio focus on mobile
      if ('mediaSession' in navigator) {
        this.updateMediaSessionMetadata();
      }

      const audioUrl = this.getAudioUrl(this.currentSong);
      if (audioUrl) {
        await this.audioElement.play();
      }
    } catch (error) {
      console.error('Play error:', error);
      
      // If autoplay is blocked, we can't do much
      // User needs to interact with the page first
      if ((error as Error).name === 'NotAllowedError') {
        console.warn('Autoplay blocked. User interaction required.');
      }
    }
  }

  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex++;
      this.loadSong(this.playlist[this.currentIndex]);
      this.play();
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadSong(this.playlist[this.currentIndex]);
      this.play();
    }
  }

  seek(time: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
      this.currentTime = time;
      this.notifyListeners();
    }
  }

  setVolume(volume: number) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setPlaybackRate(rate: number) {
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  jumpToIndex(index: number) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentIndex = index;
      this.loadSong(this.playlist[index]);
      this.play();
    }
  }

  // Clean up
  destroy() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.removeEventListener('play', this.handlePlay);
      this.audioElement.removeEventListener('pause', this.handlePause);
      this.audioElement.removeEventListener('ended', this.handleEnded);
      this.audioElement.removeEventListener('timeupdate', this.handleTimeUpdate);
      this.audioElement.removeEventListener('durationchange', this.handleDurationChange);
      this.audioElement.removeEventListener('volumechange', this.handleVolumeChange);
      this.audioElement.removeEventListener('error', this.handleError);
      this.audioElement.removeEventListener('loadedmetadata', this.handleLoadedMetadata);
      
      if (this.audioElement.parentNode) {
        this.audioElement.parentNode.removeChild(this.audioElement);
      }
      
      this.audioElement = null;
    }
    
    this.listeners.clear();
  }

  // Check if the current song can be played with HTML5 audio
  canPlayWithAudio(): boolean {
    return this.currentSong ? this.getAudioUrl(this.currentSong) !== null : false;
  }

  // Enable audio session on user interaction (required for mobile)
  async enableAudioSession() {
    if (!this.isInitialized || !this.audioElement) return;

    try {
      // Play and immediately pause to activate audio session
      await this.audioElement.play();
      this.audioElement.pause();
      console.log('Audio session enabled');
    } catch (error) {
      console.warn('Could not enable audio session:', error);
    }
  }
}

// Export singleton instance
export const audioPlayer = new AudioPlayerService();
