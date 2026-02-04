import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "./MainLayout";
import PageTransition from "./PageTransition";
import {
  FeedSkeleton,
  SearchResultsSkeleton,
  ProfileSkeleton,
  UserProfileSkeleton,
  CreatePlaylistSkeleton,
  SettingsSkeleton,
  PlaylistDetailSkeleton,
  AuthSkeleton,
} from "@/components/skeletons";

// Lazy load pages for better code splitting
const Feed = lazy(() => import("@/pages/Feed"));
const Search = lazy(() => import("@/pages/Search"));
const Profile = lazy(() => import("@/pages/Profile"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const CreatePlaylist = lazy(() => import("@/pages/CreatePlaylist"));
const Settings = lazy(() => import("@/pages/Settings"));
const EditPlaylist = lazy(() => import("@/pages/EditPlaylist"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const ViewPlaylist = lazy(() => import("@/pages/ViewPlaylist"));
const Install = lazy(() => import("@/pages/Install"));
const Player = lazy(() => import("@/pages/Player"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Wrapper component for lazy loaded pages with skeleton fallback
const LazyPage = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) => (
  <Suspense fallback={<div className="animate-fade-in">{fallback}</div>}>
    {children}
  </Suspense>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/sign-in"
          element={
            <PageTransition>
              <LazyPage fallback={<div className="min-h-screen" />}>
                <SignIn />
              </LazyPage>
            </PageTransition>
          }
        />
        <Route
          path="/sign-up"
          element={
            <PageTransition>
              <LazyPage fallback={<div className="min-h-screen" />}>
                <SignUp />
              </LazyPage>
            </PageTransition>
          }
        />

        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <PageTransition>
                <LazyPage fallback={<FeedSkeleton count={3} />}>
                  <Feed />
                </LazyPage>
              </PageTransition>
            }
          />
          <Route
            path="/search"
            element={
              <PageTransition>
                <LazyPage fallback={<div className="min-h-screen" />}>
                  <Search />
                </LazyPage>
              </PageTransition>
            }
          />
          <Route
            path="/profile"
            element={
              <PageTransition>
                <LazyPage fallback={<ProfileSkeleton />}>
                  <Profile />
                </LazyPage>
              </PageTransition>
            }
          />
          <Route
            path="/user/:username"
            element={
              <PageTransition>
                <LazyPage fallback={<UserProfileSkeleton />}>
                  <UserProfile />
                </LazyPage>
              </PageTransition>
            }
          />
          <Route
            path="/playlist/create"
            element={
              <PageTransition>
                <LazyPage fallback={<CreatePlaylistSkeleton />}>
                  <CreatePlaylist />
                </LazyPage>
              </PageTransition>
            }
          />
          <Route
            path="/settings"
            element={
              <PageTransition>
                <LazyPage fallback={<SettingsSkeleton />}>
                  <Settings />
                </LazyPage>
              </PageTransition>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <PageTransition>
                <LazyPage fallback={<ProfileSkeleton />}>
                  <EditProfile />
                </LazyPage>
              </PageTransition>
            }
          />
          <Route
            path="/playlist/:id"
            element={
              <PageTransition>
                <LazyPage fallback={<PlaylistDetailSkeleton />}>
                  <ViewPlaylist />
                </LazyPage>
              </PageTransition>
            }
          />
          <Route
            path="/playlist/:id/edit"
            element={
              <PageTransition>
                <LazyPage fallback={<PlaylistDetailSkeleton />}>
                  <EditPlaylist />
                </LazyPage>
              </PageTransition>
            }
          />
          <Route
            path="/install"
            element={
              <PageTransition>
                <LazyPage fallback={<SettingsSkeleton />}>
                  <Install />
                </LazyPage>
              </PageTransition>
            }
          />
        </Route>

        <Route
          path="/player"
          element={
            <PageTransition>
              <LazyPage fallback={<div className="min-h-screen bg-background" />}>
                <Player />
              </LazyPage>
            </PageTransition>
          }
        />

        <Route
          path="*"
          element={
            <PageTransition>
              <LazyPage fallback={<div className="min-h-screen" />}>
                <NotFound />
              </LazyPage>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
