import { useState, useEffect } from "react";
import { Search as SearchIcon, X, Users, Music2, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSocial } from "@/contexts/SocialContext";
import { usePlaylist } from "@/contexts/PlaylistContext";
import UserCard from "@/components/UserCard";
import { useNavigate } from "react-router-dom";
import { Link2 } from "lucide-react";
import { searchAPI } from "@/lib/api";
import { SearchResultsSkeleton } from "@/components/skeletons";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "users" | "playlists" | "tags">("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState({
    users: [],
    playlists: [],
    tags: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { users } = useSocial();
  const { playlists, savedPlaylists } = usePlaylist();
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Perform search when query or filter changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults({ users: [], playlists: [], tags: [] });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (activeFilter === "all") {
          const response = await searchAPI.universalSearch({
            q: searchQuery,
            limit: 20
          });
          setSearchResults(response.data);
        } else if (activeFilter === "users") {
          const response = await searchAPI.searchUsers({
            q: searchQuery,
            limit: 20
          });
          setSearchResults({
            users: response.data.users,
            playlists: [],
            tags: []
          });
        } else if (activeFilter === "playlists") {
          const response = await searchAPI.searchPlaylists({
            q: searchQuery,
            limit: 20
          });
          setSearchResults({
            users: [],
            playlists: response.data.playlists,
            tags: []
          });
        } else if (activeFilter === "tags") {
          const response = await searchAPI.searchTags({
            q: searchQuery,
            limit: 20
          });
          setSearchResults({
            users: [],
            playlists: [],
            tags: response.data.tags
          });
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to perform search");
        setSearchResults({ users: [], playlists: [], tags: [] });
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300); // Debounce search
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeFilter]);

  // Save search to recent
  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const removeRecentSearch = (search: string) => {
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Combine all playlists for search
  const allPlaylists = [...playlists, ...savedPlaylists];

  // Get all unique tags
  const allTags = Array.from(new Set(allPlaylists.flatMap(p => p.tags)));

  // Trending tags (mock data)
  const trendingTags = ["chill", "vibes", "workout", "lofi", "indie", "roadtrip"];

  const hasResults = searchQuery && (searchResults.users.length > 0 || searchResults.playlists.length > 0 || searchResults.tags.length > 0);
  const isSearching = searchQuery.length > 0;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      console.log("[SEARCH_QUERY]", {
        query,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveSearch(searchQuery.trim());
      console.log("[SEARCH_SUBMITTED]", {
        query: searchQuery,
        resultsCount: {
          users: searchResults.users.length,
          playlists: searchResults.playlists.length,
          tags: searchResults.tags.length
        },
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setActiveFilter("tags");
    saveSearch(tag);
    console.log("[TAG_SEARCH]", {
      tag,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Header with Search */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold mb-3">Search</h1>
          
          <form onSubmit={handleSearchSubmit} className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users, playlists, or tags..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </form>
        </div>

        {/* Filter Tabs */}
        {isSearching && (
          <div className="flex border-b border-border px-4 gap-2 overflow-x-auto">
            {[
              { key: "all", label: "All" },
              { key: "users", label: "Users", icon: Users },
              { key: "playlists", label: "Playlists", icon: Music2 },
              { key: "tags", label: "Tags" }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                className={`py-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-colors text-sm whitespace-nowrap ${
                  activeFilter === filter.key
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="px-4 py-6">
        {!isSearching ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Recent Searches</h2>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-accent hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-full group"
                    >
                      <button
                        onClick={() => handleSearch(search)}
                        className="text-sm"
                      >
                        {search}
                      </button>
                      <button
                        onClick={() => removeRecentSearch(search)}
                        className="p-0.5 hover:bg-muted rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Tags */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold">Trending Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm hover:bg-accent/20 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold">Suggested Users</h2>
              </div>
              <div className="space-y-1">
                {users.slice(0, 5).map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Search Results */}
            {isLoading ? (
              <SearchResultsSkeleton 
                type={activeFilter === "all" ? "mixed" : activeFilter === "tags" ? "playlists" : activeFilter} 
                count={4} 
              />
            ) : error ? (
              <div className="py-16 text-center">
                <p className="text-red-500 mb-2">Search failed</p>
                <p className="text-muted-foreground text-sm">{error}</p>
              </div>
            ) : !hasResults ? (
              <div className="py-16 text-center">
                <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-1">No results found</p>
                <p className="text-muted-foreground text-sm">
                  Try searching for something else
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Users Results */}
                {(activeFilter === "all" || activeFilter === "users") && searchResults.users.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-accent" />
                      <h2 className="text-sm font-semibold">Users ({searchResults.users.length})</h2>
                    </div>
                    <div className="space-y-1">
                      {searchResults.users.slice(0, activeFilter === "users" ? undefined : 3).map((user) => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    </div>
                    {activeFilter === "all" && searchResults.users.length > 3 && (
                      <button
                        onClick={() => setActiveFilter("users")}
                        className="mt-2 text-sm text-accent hover:underline"
                      >
                        View all {searchResults.users.length} users
                      </button>
                    )}
                  </div>
                )}

                {/* Playlists Results */}
                {(activeFilter === "all" || activeFilter === "playlists") && searchResults.playlists.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Music2 className="w-4 h-4 text-accent" />
                      <h2 className="text-sm font-semibold">Playlists ({searchResults.playlists.length})</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {searchResults.playlists.slice(0, activeFilter === "playlists" ? undefined : 4).map((playlist) => (
                        <div
                          key={playlist.id}
                          onClick={() => {
                            saveSearch(searchQuery);
                            navigate(`/playlist/${playlist.id}`);
                          }}
                          className="cursor-pointer group"
                        >
                          <div className={`aspect-square rounded-xl bg-gradient-to-br ${playlist.coverGradient} mb-2 flex items-center justify-center transition-transform group-hover:scale-[1.02]`}>
                            <Link2 className="w-8 h-8 text-white/30" />
                          </div>
                          <p className="text-sm font-medium truncate">{playlist.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {playlist.songCount || playlist.songs?.length || 0} songs • {playlist.likesCount || 0} likes
                          </p>
                          {playlist.tags?.length > 0 && (
                            <p className="text-xs text-accent mt-1">#{playlist.tags[0]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    {activeFilter === "all" && searchResults.playlists.length > 4 && (
                      <button
                        onClick={() => setActiveFilter("playlists")}
                        className="mt-3 text-sm text-accent hover:underline"
                      >
                        View all {searchResults.playlists.length} playlists
                      </button>
                    )}
                  </div>
                )}

                {/* Tags Results */}
                {(activeFilter === "all" || activeFilter === "tags") && searchResults.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <h2 className="text-sm font-semibold">Tags ({searchResults.tags.length})</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.tags.map((tag) => (
                        <button
                          key={tag.name || tag}
                          onClick={() => handleTagClick(tag.name || tag)}
                          className="bg-accent/10 text-accent px-3 py-2 rounded-lg text-sm hover:bg-accent/20 transition-colors flex flex-col items-start"
                        >
                          <span>#{tag.name || tag}</span>
                          <span className="text-xs text-muted-foreground">{tag.playlistCount || tag.count || 0} playlists</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
