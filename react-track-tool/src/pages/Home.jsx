import styles from "./static/Home.module.css"
import { useEffect } from "react";
import { useStore } from "../store/useStore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import defaultUserIMG from "../assets/defaultUser.png"
import Header from "../components/Header";
function Home() {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();

  const navProfile = () => {
    navigate('/profile');
  }

  const logOut = () => {
    signOut(auth);
  }

  return (
    <div className={styles.container}>
      <Header showProfile />
      <h1>Home</h1>
      {user && <p>Welcome, {user.username}</p>}
    </div>
  );
}

export default Home;