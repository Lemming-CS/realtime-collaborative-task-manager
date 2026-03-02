import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile.jsx";
import { useStore } from "./store/useStore.js";
import { Navigate } from "react-router-dom";
import { useThemeEffect } from "./hooks/useThemeEffect.jsx";
import { useAuthListener } from "./hooks/useAuthListener.jsx";

function App() {
  const user = useStore(state => state.user);
  useThemeEffect();
  useAuthListener();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
