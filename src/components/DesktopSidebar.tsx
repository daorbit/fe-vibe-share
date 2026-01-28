import { Home, User, Search, LogOut, Plus, Sparkles } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button, Typography, App } from "antd";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import UserAvatar from "@/components/UserAvatar";

const { Text } = Typography;

const DesktopSidebar = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const { message } = App.useApp();

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Explore" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    message.success("Logged out successfully");
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/sign-in");
  };

  const handleCreatePlaylist = () => {
    if (isLoggedIn) {
      navigate("/playlist/create");
    } else {
      navigate("/sign-in");
    }
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-sidebar flex-col z-50 border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gradient">Now Music</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                        isActive 
                          ? "bg-gradient-to-br from-primary to-accent shadow-lg" 
                          : "bg-secondary/50"
                      )}>
                        <Icon className={cn("w-5 h-5", isActive ? "text-white" : "")} />
                      </div>
                      <span className="text-[15px]">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Create Playlist Button */}
        <div className="mt-8 px-2">
          <Button 
            type="primary" 
            block 
            size="large"
            onClick={handleCreatePlaylist}
            className="!h-14 !rounded-xl btn-gradient !border-0 !flex !items-center !justify-center !gap-3"
            icon={<Plus className="w-5 h-5" />}
          >
            <span className="font-semibold">Create Playlist</span>
          </Button>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        {isLoggedIn ? (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <UserAvatar avatarUrl={user?.avatarUrl} size={48} className="avatar-ring" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-sidebar" />
              </div>
              <div className="flex-1 min-w-0">
                <Text className="font-semibold text-sm block truncate">{user?.username}</Text>
                <Text type="secondary" className="text-xs block truncate">{user?.email}</Text>
              </div>
            </div>
            <Button 
              block
              onClick={handleLogout} 
              className="!h-10 !rounded-xl !bg-secondary/50 !border-0 hover:!bg-destructive/20 hover:!text-destructive !flex !items-center !justify-center !gap-2"
              icon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            type="primary" 
            block 
            size="large"
            onClick={handleLogin} 
            className="!h-12 !rounded-xl btn-gradient !border-0"
          >
            Sign In
          </Button>
        )}
      </div>
    </aside>
  );
};

export default DesktopSidebar;