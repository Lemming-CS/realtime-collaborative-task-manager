import { useEffect } from "react";
import { useStore } from "../store/useStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

function Home() {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="body">
      <h1>Home</h1>
      {user && <p>Welcome, {user.username}</p>}
    </div>
  );
}

export default Home;