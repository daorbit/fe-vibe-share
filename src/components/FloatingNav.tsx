import { Home, Search, Plus, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { triggerHaptic } from "@/hooks/useHaptic";
import { useClickSound } from "@/hooks/useClickSound";
import NotificationSheet from "./NotificationSheet";

interface FloatingNavProps {
  unreadCount?: number;
  onUnreadCountChange?: (count: number) => void;
}

const FloatingNav = ({ unreadCount = 0, onUnreadCountChange = () => {} }: FloatingNavProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const { playSound } = useClickSound();

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(420px,calc(100vw-2rem))]">
      <div className="flex w-full items-center justify-between px-4 py-2.5 rounded-full bg-background/80 backdrop-blur-xl border border-border/40 shadow-lg">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => {
                playSound('tap');
                triggerHaptic('light');
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center p-2.5 rounded-full transition-all duration-200 active:scale-95 flex-shrink-0",
                  isActive
                    ? "bg-primary/10"
                    : "hover:bg-foreground/5"
                )
              }
            >
              {({ isActive }) => (
                <Icon 
                  className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  fill={isActive ? "currentColor" : "none"}
                />
              )}
            </NavLink>
          );
        })}
        
        <button
          onClick={() => {
            playSound('tap');
            triggerHaptic('medium');
            navigate(isLoggedIn ? "/playlist/create" : "/sign-in");
          }}
          className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-90 shadow-md"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
        
        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => {
                playSound('tap');
                triggerHaptic('light');
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center p-2.5 rounded-full transition-all duration-200 active:scale-95 flex-shrink-0",
                  isActive
                    ? "bg-primary/10"
                    : "hover:bg-foreground/5"
                )
              }
            >
              {({ isActive }) => (
                <Icon 
                  className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  fill={isActive ? "currentColor" : "none"}
                />
              )}
            </NavLink>
          );
        })}
        
        {/* Notification Bell - Always show */}
        <NotificationSheet 
          unreadCount={unreadCount}
          onUnreadCountChange={onUnreadCountChange}
          isLoggedIn={isLoggedIn}
          onNotLoggedInClick={() => {
            playSound('tap');
            triggerHaptic('light');
            navigate('/sign-in');
          }}
        />
      </div>
    </nav>
  );
};

export default FloatingNav;