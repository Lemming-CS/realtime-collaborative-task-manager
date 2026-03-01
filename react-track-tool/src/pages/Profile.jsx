import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import styles from "./static/Profile.module.css";
import { useEffect } from "react";
import { useStore } from "../store/useStore";

function Profile() {
    const setUser = useStore(state => state.setUser);
    const navigate = useNavigate();

    const navHome = () => {
        navigate('/');
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
            <button onClick={navHome}>Home</button>
            <button onClick={logOut}>Log Out</button>
        </div>
        <div className="profile">
            <div>
                <button><img /></button>
            </div>
        </div>
    </div>
    )
}

export default Profile;