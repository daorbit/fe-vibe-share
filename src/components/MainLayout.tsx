import { Outlet } from "react-router-dom";
import FloatingNav from "./FloatingNav";
import WelcomeDrawer from "./WelcomeDrawer";
import { useWelcome } from "@/contexts/WelcomeContext";

const MainLayout = () => {
  const { isWelcomeOpen, closeWelcome } = useWelcome();

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="pb-24">
        <Outlet />
      </div>
      
      {/* Floating Navigation - Both Mobile & Desktop */}
      <FloatingNav />
      
      {/* Welcome Drawer - Shows on first visit or when triggered */}
      <WelcomeDrawer isOpen={isWelcomeOpen} onClose={closeWelcome} />
    </div>
  );
};

export default MainLayout;
