import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Error from "./components/Error";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useContext, useState } from "react";
import { LoginContext } from "./components/ContextProvider/Context";
import "./App.css";
import React from "react";
import SideBar from "./components/SideBar";
import Home from "./pages/Home";
import UploadText from "./pages/UploadText";
import Diacritization from "./pages/Diacritization";
import SyntacticAnalysis from "./pages/SyntacticAnalysis";
import StandardSolutions from "./pages/StandardSolutions";
import Test from "./pages/Test";
import GiveFeedback from "./pages/GiveFeedback";
import SemanticAnalysis from "./pages/SemanticAnalysis";

function App() {
  const [data, setData] = useState(false);
  const { setLoginData } = useContext(LoginContext);
  const history = useNavigate();

  const DashboardValid = async () => {
    let token = localStorage.getItem("usersdatatoken");

    const res = await fetch("/validuser", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const data = await res.json();

    if (data.status === 401 || !data) {
      console.log("user not valid");
    } else {
      console.log("user verify");
      setLoginData(data);
      history("/home"); // Redirect to the dashboard
    }
  };

  useEffect(() => {
    setTimeout(() => {
      DashboardValid();
      setData(true);
    }, 2000);
  }, []);

  return (
    <>
      {data ? (
        <>
          <Header />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <SideBar>
            <Routes>
              <Route path="*" element={<Error />} />
              <Route path="/home" element={<Home />} />
              <Route path="/uploadtext" element={<UploadText />} />
              <Route path="/diacritization" element={<Diacritization />} />
              <Route path="/syntacticanalysis" element={<SyntacticAnalysis />}/>
              <Route path="/semanticanalysis" element={<SemanticAnalysis/>}/>
              <Route path="/standardsolutions" element={<StandardSolutions />}/>
              <Route path="/test" element={<Test />} />
              <Route path="/standardsolutions/givefeedback" element={<GiveFeedback/>} />
            </Routes>
          </SideBar>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          Loading... &nbsp;
          <CircularProgress />
        </Box>
      )}
    </>
  );
}

export default App;
