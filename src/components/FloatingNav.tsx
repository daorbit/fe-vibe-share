import { Home, Search, Plus, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { triggerHaptic } from "@/hooks/useHaptic";
import { useClickSound } from "@/hooks/useClickSound";

const FloatingNav = () => {
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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(600px,calc(100vw-2rem))]">
      <div className="flex w-full items-center justify-between gap-1 px-2.5 py-1.5 rounded-[2.25rem] bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-6 py-1.5 rounded-[1.5rem] transition-all duration-300",
                  isActive
                    ? "bg-foreground/5"
                    : "hover:bg-foreground/5"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    fill={isActive ? "currentColor" : "none"}
                  />
                  <span className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
        
        {/* Create Button */}
        <button
          onClick={() => {
            playSound('tap');
            triggerHaptic('medium');
            navigate(isLoggedIn ? "/playlist/create" : "/sign-in");
          }}
          className="w-11 h-11 ml-1 rounded-full bg-primary flex items-center justify-center text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
};

export default FloatingNav;