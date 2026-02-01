export interface PlaylistTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tags: string[];
  gradient: string;
  suggestedSongs?: Array<{
    title: string;
    artist: string;
    platform: string;
  }>;
}

export const playlistTemplates: PlaylistTemplate[] = [
  {
    id: "workout",
    name: "Workout Mix",
    emoji: "💪",
    description: "High-energy tracks to power your fitness routine",
    tags: ["workout", "fitness", "energy"],
    gradient: "from-red-800 to-orange-900",
    suggestedSongs: [
      { title: "Eye of the Tiger", artist: "Survivor", platform: "YouTube" },
      { title: "Stronger", artist: "Kanye West", platform: "YouTube" },
      { title: "Till I Collapse", artist: "Eminem", platform: "YouTube" },
    ]
  },
  {
    id: "chill",
    name: "Chill Vibes",
    emoji: "🌊",
    description: "Relaxing tunes for unwinding and peaceful moments",
    tags: ["chill", "relax", "vibes"],
    gradient: "from-blue-800 to-indigo-900",
    suggestedSongs: [
      { title: "Weightless", artist: "Marconi Union", platform: "YouTube" },
      { title: "Sunset Lover", artist: "Petit Biscuit", platform: "YouTube" },
      { title: "Breathe", artist: "Télépopmusik", platform: "YouTube" },
    ]
  },
  {
    id: "study",
    name: "Study Focus",
    emoji: "📚",
    description: "Concentration-enhancing music for productive sessions",
    tags: ["study", "focus", "productivity"],
    gradient: "from-green-800 to-teal-900",
    suggestedSongs: [
      { title: "Lofi Hip Hop Mix", artist: "ChilledCow", platform: "YouTube" },
      { title: "Study Music", artist: "Study Music Project", platform: "YouTube" },
      { title: "Focus Flow", artist: "Calm", platform: "YouTube" },
    ]
  },
  {
    id: "party",
    name: "Party Time",
    emoji: "🎉",
    description: "Dance floor anthems and crowd pleasers",
    tags: ["party", "dance", "fun"],
    gradient: "from-purple-800 to-pink-900",
    suggestedSongs: [
      { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", platform: "YouTube" },
      { title: "Don't Stop Me Now", artist: "Queen", platform: "YouTube" },
      { title: "Levitating", artist: "Dua Lipa", platform: "YouTube" },
    ]
  },
  {
    id: "roadtrip",
    name: "Road Trip",
    emoji: "🚗",
    description: "Perfect soundtrack for long drives and adventures",
    tags: ["roadtrip", "travel", "adventure"],
    gradient: "from-amber-800 to-rose-900",
    suggestedSongs: [
      { title: "Life is a Highway", artist: "Tom Cochrane", platform: "YouTube" },
      { title: "Take Me Home, Country Roads", artist: "John Denver", platform: "YouTube" },
      { title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", platform: "YouTube" },
    ]
  },
  {
    id: "morning",
    name: "Morning Boost",
    emoji: "☀️",
    description: "Uplifting songs to start your day right",
    tags: ["morning", "energy", "positive"],
    gradient: "from-cyan-800 to-blue-900",
    suggestedSongs: [
      { title: "Here Comes the Sun", artist: "The Beatles", platform: "YouTube" },
      { title: "Good Morning", artist: "Kanye West", platform: "YouTube" },
      { title: "Walking on Sunshine", artist: "Katrina and the Waves", platform: "YouTube" },
    ]
  },
  {
    id: "sleep",
    name: "Sleep Sounds",
    emoji: "😴",
    description: "Calming melodies for restful sleep",
    tags: ["sleep", "calm", "night"],
    gradient: "from-fuchsia-800 to-purple-900",
    suggestedSongs: [
      { title: "Sleep Music", artist: "Yellow Brick Cinema", platform: "YouTube" },
      { title: "Moonlight Sonata", artist: "Beethoven", platform: "YouTube" },
      { title: "Nocturne", artist: "Chopin", platform: "YouTube" },
    ]
  },
  {
    id: "gaming",
    name: "Gaming Zone",
    emoji: "🎮",
    description: "Epic soundtracks for gaming sessions",
    tags: ["gaming", "epic", "focus"],
    gradient: "from-emerald-800 to-cyan-900",
    suggestedSongs: [
      { title: "BFG Division", artist: "Mick Gordon", platform: "YouTube" },
      { title: "Dragonborn", artist: "Jeremy Soule", platform: "YouTube" },
      { title: "Gerudo Valley", artist: "Koji Kondo", platform: "YouTube" },
    ]
  },
  {
    id: "blank",
    name: "Blank Canvas",
    emoji: "✨",
    description: "Start from scratch with your own unique mix",
    tags: [],
    gradient: "from-purple-800 to-pink-900",
  }
];
