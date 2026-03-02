import styles from "./static/Login.module.css";
import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import googleIMG from "../assets/google.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {db, auth} from "../firebase/config.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useStore } from "../store/useStore.js";
import Header from "../components/Header.jsx";
import getFirestoreInfo from "../store/getFirestoreInfo";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const setUser = useStore( state => state.setUser);
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        setErrorMessage("Please verify your email before logging in.");
        return;
      }
      await getFirestoreInfo(user);
      navigate("/");
    }
      catch (error) {
      if (error.code === "auth/invalid-credential") {
          setErrorMessage("Invalid password or Email");
        }
      else if (error.code === "auth/missing-password") {
        setErrorMessage("Missing password");
      }
      else if (error.code === "auth/invalid-email") {
        setErrorMessage("Missing Email");
      }
      else {
        setErrorMessage(error.code);
        }
      }
  }


  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const newUser = {
          username: user.displayName || "New User",
          email: user.email,
          createdAt: new Date()
        };
        await setDoc(userDocRef, newUser);
        setUser(newUser);
      }
      else {
        await getFirestoreInfo(user);
      }
      navigate("/");
    }
    catch (error) {
        setErrorMessage(error.message);
    }
  };

  return (
    <>
    <Header/>
    <div className={styles.login}>
      <h1>Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <span className="error">{errorMessage}</span>
      <button onClick={handleLogin}>Login</button>
      <button className={styles.googleBtn} onClick={handleGoogleLogin}>
        <img src={googleIMG} alt="Google Logo" />
        <span>Continue with Google</span>
      </button>
      <Link to="/register" id="redirect">
        Don't have an account?
      </Link>

    </div>
  </>
  )}

export default Login;