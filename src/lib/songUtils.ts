export const detectPlatform = (url: string): string => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("spotify.com")) return "Spotify";
  if (url.includes("soundcloud.com")) return "SoundCloud";
  if (url.includes("apple.com") || url.includes("music.apple")) return "Apple Music";
  if (url.includes("deezer.com")) return "Deezer";
  if (url.includes("tidal.com")) return "Tidal";
  return "Link";
};

export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const getYouTubeThumbnail = (url: string): string | null => {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  return null;
};

export const getSoundCloudThumbnail = (): string => {
  return "https://res.cloudinary.com/dkt6vvcdo/image/upload/v1737893600/soundcloud-default_xtqzpz.jpg";
};

export const getAppleMusicThumbnail = (): string => {
  return "https://res.cloudinary.com/dkt6vvcdo/image/upload/v1737893600/apple-music-default_jqwxyz.jpg";
};

export const getSpotifyThumbnail = (): string => {
  return "https://res.cloudinary.com/dkt6vvcdo/image/upload/v1769432574/spotify-playlist-featured_rbxrle.jpg";
};

export const getPlatformThumbnail = (url: string): string | null => {
  const platform = detectPlatform(url);
  if (platform === "YouTube") {
    return getYouTubeThumbnail(url);
  }
  if (platform === "Spotify") {
    return getSpotifyThumbnail();
  }
  if (platform === "SoundCloud") {
    return getSoundCloudThumbnail();
  }
  if (platform === "Apple Music") {
    return getAppleMusicThumbnail();
  }
  return null;
};

export const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "YouTube": return "bg-red-500/20 text-red-400";
    case "Spotify": return "bg-green-500/20 text-green-400";
    case "SoundCloud": return "bg-orange-500/20 text-orange-400";
    case "Apple Music": return "bg-pink-500/20 text-pink-400";
    case "Deezer": return "bg-purple-500/20 text-purple-400";
    case "Tidal": return "bg-blue-500/20 text-blue-400";
    default: return "bg-muted text-muted-foreground";
  }
};

export const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "YouTube": return "🎬";
    case "Spotify": return "🎵";
    case "SoundCloud": return "☁️";
    case "Apple Music": return "🍎";
    case "Deezer": return "🎧";
    case "Tidal": return "🌊";
    default: return "🔗";
  }
};

export const gradients = [
  "from-purple-800 to-pink-900",
  "from-red-800 to-orange-900",
  "from-green-800 to-teal-900",
  "from-blue-800 to-indigo-900",
  "from-amber-800 to-rose-900",
  "from-cyan-800 to-blue-900",
  "from-fuchsia-800 to-purple-900",
  "from-emerald-800 to-cyan-900",
];
