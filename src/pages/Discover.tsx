import { useState } from "react";
import { Input, Empty, Tabs } from "antd";
import { Search, Users, Music2, TrendingUp, Link2 } from "lucide-react";
import { useSocial } from "@/contexts/SocialContext";
import { usePlaylist } from "@/contexts/PlaylistContext";
import UserCard from "@/components/UserCard";
import { useNavigate } from "react-router-dom";

const Discover = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const { users } = useSocial();
  const { playlists, savedPlaylists } = usePlaylist();
  const navigate = useNavigate();

  const allPlaylists = [...playlists, ...savedPlaylists];

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlaylists = allPlaylists.filter(playlist =>
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tabItems = [
    {
      key: "users",
      label: (
        <span className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          People
        </span>
      ),
      children: (
        <>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold">Suggested for you</h2>
          </div>

          {filteredUsers.length === 0 ? (
            <Empty
              image={<Users className="w-16 h-16 mx-auto text-muted-foreground" />}
              description="No users found"
              className="py-16"
            />
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </>
      ),
    },
    {
      key: "playlists",
      label: (
        <span className="flex items-center gap-2">
          <Music2 className="w-4 h-4" />
          Playlists
        </span>
      ),
      children: (
        <>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold">Trending playlists</h2>
          </div>

          {filteredPlaylists.length === 0 ? (
            <Empty
              image={<Music2 className="w-16 h-16 mx-auto text-muted-foreground" />}
              description="No playlists found"
              className="py-16"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPlaylists.map((playlist) => (
                <div 
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="cursor-pointer group"
                >
                  <div className={`aspect-square rounded-xl bg-gradient-to-br ${playlist.coverGradient} mb-2 flex items-center justify-center transition-transform group-hover:scale-[1.02]`}>
                    <Link2 className="w-8 h-8 text-white/30" />
                  </div>
                  <p className="text-sm font-medium truncate">{playlist.title}</p>
                  <p className="text-xs text-muted-foreground">{playlist.songCount || playlist.songs.length} songs • {playlist.likesCount} likes</p>
                  {playlist.tags.length > 0 && (
                    <p className="text-xs text-accent mt-1">#{playlist.tags[0]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 max-w-4xl mx-auto">
          <h1 className="text-xl font-bold mb-3">Discover</h1>
          
          {/* Search */}
          <Input
            placeholder="Search users or playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<Search className="w-4 h-4 text-muted-foreground" />}
            size="large"
            className="!bg-secondary !border-border"
          />
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="px-4"
          tabBarStyle={{ marginBottom: 16 }}
        />
      </div>
    </div>
  );
};

export default Discover;