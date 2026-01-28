import { useNavigate } from "react-router-dom";
import FeedPage from "@/components/FeedPage";
import { useAppSelector } from "@/store/hooks";

const Feed = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  const handleShareClick = () => {
    console.log("[SHARE_CLICK]", {
      isLoggedIn,
      timestamp: new Date().toISOString()
    });

    if (!isLoggedIn) {
      navigate("/sign-in");
    } else {
      // Use the dedicated full-screen route for creation
      navigate("/playlist/create");
    }
  };

  return (
    <>
      <FeedPage onShareClick={handleShareClick} isLoggedIn={isLoggedIn} />
    </>
  );
};

export default Feed;