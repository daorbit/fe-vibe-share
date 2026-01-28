import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/contexts/SocialContext";
import UserAvatar from "@/components/UserAvatar";

interface UserCardProps {
  user: UserProfile;
  showFollowButton?: boolean;
}

const UserCard = memo(({ user }: UserCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/user/${user.username}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
    >
      {/* Avatar */}
      <UserAvatar avatarUrl={user.avatarUrl} size={48} className="flex-shrink-0" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">@{user.username}</p>
        <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {user.playlistCount} playlists
        </p>
      </div>
    </div>
  );
});

UserCard.displayName = "UserCard";

export default UserCard;