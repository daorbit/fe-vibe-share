import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import UserAvatar from "./UserAvatar";

interface TopNavProps {
  onShareClick?: () => void;
  isLoggedIn?: boolean;
}

const TopNav = ({ onShareClick, isLoggedIn }: TopNavProps) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
 
          <img src="/logo.png" alt="Now Music" className="h-12 w-auto" />
        </div>
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/profile')}
        >
          <UserAvatar avatarUrl={user?.avatarUrl} size={28} />
        </div>
      </div>
    </header>
  );
};

export default TopNav;