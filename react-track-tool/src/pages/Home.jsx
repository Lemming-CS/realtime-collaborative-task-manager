import styles from "./static/Home.module.css"
import { useEffect } from "react";
import { useStore } from "../store/useStore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import defaultUserIMG from "../assets/defaultUser.png"
import sun from "../assets/sun.png";
import moon from "../assets/moon.png"

function Home() {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);

  const navProfile = () => {
    navigate('/profile');
  }

  const logOut = () => {
    signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUser(null);
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.profileButton} onClick={navProfile}>
          <img src={defaultUserIMG} />
          {user.username}
        </button>
        <div className={styles.headerRight}> 
          <button onClick={toggleTheme} id="themeButton">
            {theme === "light" ? <img src={sun}/> : <img src={moon}/>}
          </button>
          <button onClick={logOut}>Log Out</button>    
        </div>
      </div>
      <h1>Home</h1>
      {user && <p>Welcome, {user.username}</p>}
    </div>
  );
}

export default Home;