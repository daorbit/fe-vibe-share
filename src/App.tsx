import { App as AntdApp } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';
import { PlaylistProvider } from "./contexts/PlaylistContext";
import { SocialProvider } from "./contexts/SocialContext";
import { AuthProvider } from "./contexts/AuthContext";
import AuthInitializer from "./components/AuthInitializer";
import MainLayout from "./components/MainLayout";
import Feed from "./pages/Feed";
import Discover from "./pages/Discover";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CreatePlaylist from "./pages/CreatePlaylist";
import Settings from "./pages/Settings";
import EditPlaylist from "./pages/EditPlaylist";
import EditProfile from "./pages/EditProfile";
import ViewPlaylist from "./pages/ViewPlaylist";
import NotFound from "./pages/NotFound";

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
                <Routes>
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />

                  <Route element={<MainLayout />}>
                  <Route path="/" element={<Feed />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/user/:username" element={<UserProfile />} />
                  <Route path="/playlist/create" element={<CreatePlaylist />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/playlist/:id" element={<ViewPlaylist />} />
                  <Route path="/playlist/:id/edit" element={<EditPlaylist />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SocialProvider>
          </PlaylistProvider>
          </AuthProvider>
        </AuthInitializer>
      </BrowserRouter>
    </AntdApp>
  </QueryClientProvider>
);

export default App;