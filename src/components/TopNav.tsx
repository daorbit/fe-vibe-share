import { useNavigate, useLocation } from "react-router-dom";
import { HelpCircle, ArrowLeft, Settings, Share2, RefreshCw, LogOut, MoreHorizontal } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout, refreshUser } from "@/store/slices/authSlice";
import { invalidateUserPlaylists, invalidateSavedPlaylists } from "@/store/slices/playlistSlice";
import { useWelcome } from "@/contexts/WelcomeContext";
import UserAvatar from "./UserAvatar";
import { cn } from "@/lib/utils";
import { message } from "antd";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavProps {
  onShareClick?: () => void;
  isLoggedIn?: boolean;
}

const TopNav = ({ onShareClick, isLoggedIn }: TopNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { openWelcome } = useWelcome();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isProfilePage = location.pathname === '/profile';
  const isPlaylistPage = location.pathname.startsWith('/playlist/');
  const isUserProfilePage = location.pathname.startsWith('/user/');
  const isSettingsPage = location.pathname === '/settings';
  const isEditProfilePage = location.pathname === '/edit-profile';
  const isCreatePlaylistPage = location.pathname === '/playlist/create';
  const isSearchPage = location.pathname === '/search';
  const isFeedPage = location.pathname === '/' || location.pathname === '/feed';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(refreshUser()).unwrap();
      dispatch(invalidateUserPlaylists());
      dispatch(invalidateSavedPlaylists());
      message.success("Profile refreshed!");
    } catch (error) {
      message.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}/user/${user?.username}`;
    navigator.clipboard.writeText(shareUrl);
    message.success("Profile link copied!");
  };

  const handleLogout = async () => {
    await dispatch(logout());
    message.success("Logged out");
    navigate("/");
  };

  const showBackButton = isPlaylistPage || isUserProfilePage || isSettingsPage || isEditProfilePage || isSearchPage;
  const showProfileActions = isProfilePage;
  const showLogo = isFeedPage || isCreatePlaylistPage;

  return (
    <header className="bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="flex items-center justify-between px-4 h-10 max-w-lg mx-auto">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {showLogo && (
            <img src="/logo.png" alt="Now Music" className="h-10 w-auto" />
          )}
          {isProfilePage && (
            <span className="font-semibold text-sm">@{user?.username}</span>
          )}
          {(isSettingsPage || isEditProfilePage) && (
            <span className="text-sm font-medium">
              {isSettingsPage ? "Settings" : "Edit Profile"}
            </span>
          )}
        </div>

        {/* Center - Playlist Title */}
        {isPlaylistPage && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <span className="text-sm font-medium">Playlist</span>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {isPlaylistPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 -mr-2 hover:bg-secondary rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                <DropdownMenuItem onClick={() => {
                  const currentPath = location.pathname;
                  const playlistId = currentPath.split('/').pop();
                  const shareUrl = `${window.location.origin}/playlist/${playlistId}`;
                  navigator.clipboard.writeText(shareUrl);
                  message.success("Link copied!");
                }}>
                  Share Playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showProfileActions && (
            <>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-secondary/80 rounded-full transition-colors"
                title="Refresh"
              >
                <RefreshCw className={cn("w-[18px] h-[18px]", isRefreshing && "animate-spin")} />
              </button>
              <button
                onClick={handleShareProfile}
                className="p-2 hover:bg-secondary/80 rounded-full transition-colors"
                title="Share Profile"
              >
                <Share2 className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-secondary/80 rounded-full transition-colors"
                title="Settings"
              >
                <Settings className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-secondary/80 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </>
          )}
          {isFeedPage && (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;