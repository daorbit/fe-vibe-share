import { useState } from 'react';
import { Search, Music2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchAPI } from '@/lib/api';
import { getPlatformColor, getPlatformIcon } from '@/lib/songUtils';
import { cn } from '@/lib/utils';

interface SearchTabProps {
  onPlaySong: (songs: any[], startIndex: number, playlistTitle: string) => void;
}

export const SearchTab = ({ onPlaySong }: SearchTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
    return () => clearTimeout(timer);
  };

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search-songs', debouncedQuery],
    queryFn: () => searchAPI.universalSearch({ q: debouncedQuery, type: 'songs', limit: 50 }),
    enabled: debouncedQuery.length >= 2,
  });

  const handlePlaySongItem = (song: any, allSongs: any[]) => {
    const index = allSongs.findIndex(s => s._id === song._id || s.id === song.id);
    onPlaySong(allSongs, index >= 0 ? index : 0, `Search: ${debouncedQuery}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search Input */}
      <div className="p-3 border-b border-border/20 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search songs, artists, playlists..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-9 h-9 text-xs"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setSearchQuery('');
                setDebouncedQuery('');
              }}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {!debouncedQuery ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                Search for songs, artists, or playlists
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-xs text-muted-foreground">Searching...</div>
            </div>
          ) : searchResults?.data?.songs?.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                {searchResults.data.songs.length} song{searchResults.data.songs.length !== 1 ? 's' : ''} found
              </p>
              {searchResults.data.songs.map((song: any, index: number) => (
                <button
                  key={song._id || index}
                  onClick={() => handlePlaySongItem(song, searchResults.data.songs)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-muted/30 transition-colors rounded-md mb-1"
                >
                  {/* Thumbnail */}
                  {song.thumbnail ? (
                    <img
                      src={song.thumbnail}
                      alt=""
                      className="w-12 h-9 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className={`w-12 h-9 rounded flex items-center justify-center shrink-0 ${getPlatformColor(song.platform)}`}>
                      {getPlatformIcon(song.platform)}
                    </div>
                  )}

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-normal leading-tight truncate">
                      {song.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate leading-tight">
                      {song.artist}
                    </p>
                  </div>

                  {/* Platform Badge */}
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-medium shrink-0",
                    getPlatformColor(song.platform)
                  )}>
                    {song.platform}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Music2 className="w-12 h-12 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                No results found for "{debouncedQuery}"
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
