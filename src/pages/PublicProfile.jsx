import { auth} from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { signOut} from "firebase/auth";
import styles from "./static/PublicProfile.module.css";
import Header from "../components/Header";
import defaulUser from "../assets/defaultUser.png";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";

function PublicProfile() {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [userData, setUserData] = useState(null);
    const [created, setCreated] = useState("");
    useEffect(() => {
        const fetchUser = async () => {
            const userRef = doc(db, "users", uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            
            const v = data.createdAt;
            if (v?.toDate) {
                setCreated(v.toDate().toLocaleDateString());
            }
            else if (v instanceof Date) {
                setCreated(v.toLocaleDateString());
            }
            else if (typeof v === "number") {
                setCreated(new Date(v).toLocaleDateString());
            }
            else if (typeof v === "string") {
                const d = new Date(v);
                setCreated(isNaN(d.getTime()) ? "—" : d.toLocaleDateString());
            }
            else {
                setCreated("—");
            }
            } else {
                setUserData("Not Found");
            }
        };
        fetchUser();
    }, [uid]);

    const navHome = () => {
        navigate('/');
    }

    const logOut = () => {
        signOut(auth);
    }

    if (!userData) {
        return (
            <div className={styles.container}>
            <Header showHome />
            <div className={styles.profile}><h2>Loading...</h2></div>
            </div>
        );
    }

    if (userData === "Not Found") {
        return (
            <div className={styles.container}>
            <Header showHome />
            <div className={styles.profile}><h2>User Not Found</h2></div>
            </div>
        );
    }
    return (
    <div className={styles.container}>
        <Header showHome />
        <div className={styles.profile}>
            <div className={styles.profileInfo}>
                <div className={styles.profileData}>
                    <button className={styles.profileImage} onClick={() => setShowModal(true)}>
                        <img src={userData.profilePicture || defaulUser}/>
                    </button>
                    <h3>{userData.username}</h3>
                </div>
            </div>
            {userData.bio &&             (        
            <div className={styles.biography}>
                <label>Bio</label>
                <p>{userData.bio}</p>
            </div>
            )}

         <p className={styles.metaText}>Member since: {created}</p>
        </div>
{showModal && (
    <div className={styles.modalOverlay}>
        <div className={styles.modal}>
            <img id={styles.fullImage} src={userData.profilePicture || defaulUser}/>
            <button onClick={() => {setShowModal(false);}}>Cancel</button>
        </div>
    </div>
)}
    </div>
    )
}

export default PublicProfile;
