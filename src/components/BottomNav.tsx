import { Home, Search, Plus, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { triggerHaptic } from "@/hooks/useHaptic";

const BottomNav = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  const handleCreateClick = () => {
    triggerHaptic('medium');
    navigate(isLoggedIn ? "/playlist/create" : "/sign-in");
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          
          // Insert create button in the middle
          if (index === 1) {
            return (
              <div key="nav-group" className="contents">
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center gap-1 py-2 px-4 touch-manipulation min-h-[44px] min-w-[44px] justify-center",
                      isActive ? "text-primary" : "text-muted-foreground active:text-primary/70"
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
                <button
                  type="button"
                  onClick={handleCreateClick}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleCreateClick();
                  }}
                  className="flex flex-col items-center justify-center w-14 h-14 -mt-6 touch-manipulation active:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-sm">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </button>
              </div>
            );
          }
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2 px-4 touch-manipulation min-h-[44px] min-w-[44px] justify-center",
                  isActive ? "text-primary" : "text-muted-foreground active:text-primary/70"
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;