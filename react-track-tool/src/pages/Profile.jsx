import { updateDoc, doc} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import styles from "./static/Profile.module.css";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import Header from "../components/Header";
import defaulUser from "../assets/defaultUser.png";

function Profile() {
    const setUser = useStore(state => state.setUser);
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const [usernameChange, setUsernameChange] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navHome = () => {
        navigate('/');
    }

    const logOut = () => {
        signOut(auth);
    }

    const changeUsername = async () => {
        if(usernameChange.trim().length < 3 || usernameChange.trim().length > 20) {
            setErrorMessage("Username must have length between 3 and 20 characters!");
        }
        else {
            try {
                if (!auth.currentUser) return;
                const userRef = doc(db, "users", auth.currentUser.uid);
                await updateDoc(userRef, {
                    username: usernameChange.trim()
                });
                setUser({...user, username: usernameChange.trim()});
                setUsernameChange("");
            }
            catch(err) {
                console.error("Error updating username: ", err);
            }
        }
    }
    return (
    <div className={styles.container}>
        <Header showHome />
        <div className={styles.profile}>
            <div className={styles.profileInfo}>
                <div className={styles.profileData}>
                    <button className={styles.profileImage}>
                        <img src={defaulUser}/>
                    </button>
                    <h3>{user.username}</h3>
                </div>
                <h3>{user.email}</h3>
            </div>
            <div className={styles.changeUsername}>
                <input type="text" placeholder="Change Username" value={usernameChange} onChange={e => setUsernameChange(e.target.value)}/>
                <button onClick={changeUsername}>Change</button>
            </div>
            <span className="error">{errorMessage}</span>

        </div>
    </div>
    )
}

export default Profile;