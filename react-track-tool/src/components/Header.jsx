import { useStore } from "../store/useStore";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import sun from "../assets/sun.png";
import moon from "../assets/moon.png";
import styles from "./Header.module.css";
import defaultUser from "../assets/defaultUser.png";
function Header({ showHome, showProfile }) {
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const user = useStore(state => state.user);

  const navigate = useNavigate();

  const logOut = () => {
    signOut(auth);
  };

return (
  <div className={styles.header}>
    <div>
      {showHome && (
        <button onClick={() => navigate("/")}>Home</button>
      )}

      {showProfile && user && (
        <button onClick={() => navigate("/profile")} className={styles.profileButton}>
          <img src={defaultUser} />
          {user.username}
        </button>
      )}
    </div>

    <div className={styles.headerRight}>
      <button onClick={toggleTheme} id="themeButton">
        {theme === "light"
          ? <img src={sun} />
          : <img src={moon} />}
      </button>

      {user && <button onClick={logOut}>Log Out</button>}
    </div>
  </div>
);
}

export default Header;