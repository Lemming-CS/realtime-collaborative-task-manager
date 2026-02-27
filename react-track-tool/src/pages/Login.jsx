import "./static/Login.css";
import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/config";
import googleIMG from "../assets/google.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", userCredential.user);
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
      const result = await signInWithPopup(auth, provider);
      console.log("Google login:", result.user);
      navigate("/");
    } catch (error) {
    if (error.code === "auth/weak-password") {
          setErrorMessage("Password must be at least 6 characters.");
        } else if (error.code === "auth/email-already-in-use") {
          setErrorMessage("This email is already registered.");
        } else {
          setErrorMessage("Something went wrong. Try again.");
        }
      }
  };

  return (
    <div className="login">
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
      <button className="google-btn" onClick={handleGoogleLogin}>
        <img src={googleIMG} alt="Google Logo" />
        <span>Continue with Google</span>
      </button>
      <Link to="/register" id="redirect">
        Don't have an account?
      </Link>

    </div>
  )}

export default Login;