import { useNavigate } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { useAppSelector } from "../store/hooks";
import { useWelcome } from "@/contexts/WelcomeContext";
import UserAvatar from "./UserAvatar";

interface TopNavProps {
  onShareClick?: () => void;
  isLoggedIn?: boolean;
}

const TopNav = ({ onShareClick, isLoggedIn }: TopNavProps) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { openWelcome } = useWelcome();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="flex items-center justify-between px-4 h-10 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
 
          <img src="/logo.png" alt="Now Music" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openWelcome()}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            title="Help & Guide"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
          <div
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/profile')}
          >
            <UserAvatar avatarUrl={user?.avatarUrl} size={28} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;