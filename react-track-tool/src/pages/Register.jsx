import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import "./static/Register.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

function Register() {
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async () => {
        if (!userName) {
          setErrorMessage("Username shouldn't be empty!");
          return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
              await setDoc(doc(db, "users", user.uid), {
                username: userName,
                email: user.email,
                createdAt: new Date()
              });
            console.log("Succsesfully registered:" + userCredential.user);
            navigate("/login");
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
    <div className="register">
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
    </>
}
export default Register;