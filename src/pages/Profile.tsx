import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import ProfilePage from "@/components/ProfilePage";

const Profile = () => {
  const { user, isInitialized } = useAppSelector((state) => state.auth);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      navigate("/sign-in");
    }
  }, [isLoggedIn, isInitialized, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  return <ProfilePage />;
};

export default Profile;