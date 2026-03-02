import styles from "./static/Register.module.css"
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";
import Header from "../components/Header";
function Register() {

    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleRegister = async () => {
        if (!userName) {
          setErrorMessage("Username shouldn't be empty!");
          return;
        }
        else if (userName.length < 3 || userName.length > 20) {
          setErrorMessage("Username must have length between 3 and 20 characters!")
          return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendEmailVerification(user);

            await setDoc(doc(db, "users", user.uid), {
                username: userName,
                email: user.email,
                createdAt: new Date()
              });
            setShowModal(true)
        }
        catch (error) {
          if (error.code === "auth/weak-password") {
            setErrorMessage("Password must be at least 6 characters.");
          } else if (error.code === "auth/email-already-in-use") {
            setErrorMessage("This email is already registered.");
          } else {
            setErrorMessage("Something went wrong. Try again.");
          }
        }
    }

  return <>
  <Header />
    <div className={styles.register}>
      <h1>Register</h1>
      <input
        type="input"
        placeholder="Username"
        value={userName}
        onChange={e => setUserName(e.target.value)}
      />
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
      <button onClick={handleRegister}>Register</button>
      <Link to="/login" id="redirect">Login Page</Link>
    </div>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Email Verification</h2>
            <p>
              We sent a verification email. Please verify your account before logging in. Check the spam folder if you didn't get it.
            </p>
            <button onClick={() => {
              setShowModal(false);
              navigate("/login");
            }}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
}
export default Register;