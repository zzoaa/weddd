import "./assets/css/main.css";
import { useNavigate, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isLogin } from "./store/userSlice.js";

function App() {
  const dispath = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.user.userData);

  useEffect(() => {
    dispath(isLogin());
  }, [dispath]);
  useEffect(() => {
    console.log(isLoggedIn);

    if (!isLoggedIn.loggedIn) {
      const ud = sessionStorage.getItem("ud");
      if (!ud) {
        navigate("/members/login");
      }
    }
  }, [isLoggedIn, navigate]);
  return (
    <>
      <Dashboard />
    </>
  );
}

export default App;
