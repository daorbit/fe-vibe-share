import { App as AntdApp } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';
import { PlaylistProvider } from "./contexts/PlaylistContext";
import { SocialProvider } from "./contexts/SocialContext";
import { AuthProvider } from "./contexts/AuthContext";
import AuthInitializer from "./components/AuthInitializer";
import AnimatedRoutes from "./components/AnimatedRoutes";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AntdApp>
      <BrowserRouter>
        <ScrollToTop />
        <Analytics />
        <AuthInitializer>
          <AuthProvider>
            <PlaylistProvider>
              <SocialProvider>
                <AnimatedRoutes />
              </SocialProvider>
            </PlaylistProvider>
          </AuthProvider>
        </AuthInitializer>
      </BrowserRouter>
    </AntdApp>
  </QueryClientProvider>
);

export default App;