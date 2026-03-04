import { updateDoc, doc, getDoc, setDoc, deleteDoc} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import styles from "./static/Profile.module.css";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import Header from "../components/Header";
import defaulUser from "../assets/defaultUser.png";
import { deleteObject } from 'firebase/storage';
import { useRef } from 'react';
import { updatePassword } from 'firebase/auth';
import { getAuth, EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { sendEmailVerification } from 'firebase/auth';
import { deleteUser } from "firebase/auth";

function Profile() {
    const setUser = useStore(state => state.setUser);
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const [usernameChange, setUsernameChange] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const imageRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [bio, setBio] = useState("");
    const created = user?.createdAtMs ? new Date(user.createdAtMs).toLocaleDateString() : "—";

    useEffect(() => {
        const fetchUserBio = async () => {
            if (!user?.uid) return;
            try {
                const userDoc = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDoc);
                if (docSnap.exists()) {
                    setBio(docSnap.data().bio || "");
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchUserBio();
    }, [user?.uid]);

    const changeBio = async () => {
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { bio });
            setUser({ ...user, bio });
            alert("Bio updated successfully!");
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const changePassword = async () => {
        if (!auth.currentUser) return;

        const isPasswordUser = auth.currentUser.providerData.some(
            provider => provider.providerId === "password"
        );

        if (!isPasswordUser) {
            try {
                const user = auth.currentUser;

                const credential = EmailAuthProvider.credential(user.email, newPassword);
                await linkWithCredential(user, credential);

                await sendEmailVerification(user);
                alert("Check your email to verify your new password login. Check the spam folder if you didn't get it.");
                setNewPassword("")
                return;
            }
            catch(error) {
                setErrorMessage(error.message);
            }

        }

        else {
            try {
                await updatePassword(auth.currentUser, newPassword);
                setNewPassword("");
                alert("Password updated successfully!");
            } catch (error) {
                if (error.code === "auth/requires-recent-login") {
                setErrorMessage("Please re-login before changing password.");
                }
                else {
                    setErrorMessage(error.message);
                }
            }
        }
    };
    const deleteProfilePic = async () => {
        if (!user) return null;

        try {
            setShowModal(false);
            const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
            await deleteObject(storageRef);

            const userDoc = doc(db, "users", auth.currentUser.uid);

            await updateDoc(userDoc, {
                profilePicture: null
            });

            setUser({ ...user, profilePicture: null });

        } catch (err) {
            setErrorMessage(err.message);
        }
    };
    const deleteAccount = async () => {
        if (!auth.currentUser) return;

        const confirmDelete = window.confirm(
            "Are you sure you want to permanently delete your account? This cannot be undone."
        );

        if (!confirmDelete) return;

        try {
            const uid = auth.currentUser.uid;


            try {
            const storageRef = ref(storage, `profile_pictures/${uid}`);
            await deleteObject(storageRef);
            } catch (e) {
            }

            await deleteDoc(doc(db, "users", uid));

            await deleteUser(auth.currentUser);

            setUser(null);

            navigate("/login");
        } catch (error) {
            if (error.code === "auth/requires-recent-login") {
            alert("Please re-login before deleting your account.");
            } else {
            console.error(error);
            setErrorMessage(error.message);
            }
        }
    };
    const changeProfilePic = async (imageFile) => {
        if (!imageFile) return null;
        if (!user) return null;
        try {
            setShowModal(false);
            const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
            await uploadBytes(storageRef, imageFile);
            const imageURL = await getDownloadURL(storageRef)
            const userDoc = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userDoc, {
                profilePicture: imageURL
            });
            setUser({...user, profilePicture: imageURL});
            imageRef.current.value = "";
        }
        catch(err) {
            setErrorMessage(err.message);
        }

    }
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
        <Header showHome showBell/>
        <div className={styles.profile}>
            <div className={styles.profileInfo}>
                <div className={styles.profileData}>
                    <button className={styles.profileImage} onClick={() => setShowModal(true)}>
                        <img src={user.profilePicture || defaulUser}/>
                            <div className={styles.editOverlay}>
                                ✏️
                            </div>
                        <input type="file" id="fileInput" ref={imageRef} accept="image/png, image/jpeg, image/jpg" onChange={(e) => changeProfilePic(e.target.files[0])} hidden/>
                    </button>
                    <h3>{user.username}</h3>
                </div>
                <h3>{user.email}</h3>
            </div>
            <div className={styles.profileData}>
                <div className={styles.biography}>
                    <label>Bio</label>
                    <textarea
                        value={bio}
                        placeholder="Tell us about yourself..."
                        onChange={e => setBio(e.target.value)}
                    />
                    <button onClick={changeBio}>Update</button>
                </div>

                <div className={styles.credentialsContainer}>
                    <div className={styles.changeCredentials}>
                        <input type="text" placeholder="Change Username" value={usernameChange} autoComplete="New-Username" onChange={e => setUsernameChange(e.target.value)}/>
                        <button onClick={changeUsername}>Change</button>
                    </div>
                    <div className={styles.changeCredentials}>
                        <input type="password" placeholder="Change Password" value={newPassword} autoComplete="New-Password" onChange={e => setNewPassword(e.target.value)}/>
                        <button onClick={changePassword}>Change</button>
                    </div>
                    <span className="error">{errorMessage}</span>
                </div>
            </div>
                <h3>Member since: {created}</h3>
                <button onClick={deleteAccount} style={{marginTop: "20px", background: "#ff3b30", color: "white"}}>Delete Account</button>

        </div>
{showModal && (
    <div className={styles.modalOverlay}>
        <div className={styles.modal}>
            <img id={styles.fullImage} src={user.profilePicture || defaulUser}/>
            <div className={styles.profileButtons}>
                <button onClick={() => imageRef.current.click()}>Update PFP</button>
                <button onClick={deleteProfilePic}>Remove PFP</button>
                <button onClick={() => {
                setShowModal(false);}}>
                Cancel
                </button>
            </div>
        </div>
    </div>
)}
    </div>
)};

export default Profile;