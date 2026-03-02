import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import styles from "./static/Profile.module.css";
import { useEffect } from "react";
import { useStore } from "../store/useStore";
import Header from "../components/Header";
function Profile() {
    const setUser = useStore(state => state.setUser);
    const navigate = useNavigate();
    const toggleTheme = useStore( state => state.toggleTheme);
    const theme = useStore( state => state.theme);

    const navHome = () => {
        navigate('/');
    }

    const logOut = () => {
        signOut(auth);
    }

    return (
    <div className={styles.container}>
        <Header showHome />
        <div className="profile">
            <div>
                <button><img /></button>
            </div>
        </div>
    </div>
    )
}

export default Profile;