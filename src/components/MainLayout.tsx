import { Outlet } from "react-router-dom";
import FloatingNav from "./FloatingNav";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="pb-24">
        <Outlet />
      </div>
      
      {/* Floating Navigation - Both Mobile & Desktop */}
      <FloatingNav />
    </div>
  );
};

export default MainLayout;
