import React, { useEffect, useContext, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { LoginContext } from "./components/ContextProvider/Context";
import SideBar from "./components/SideBar";
import Home from "./pages/Home";
import UploadText from "./pages/UploadText";
import Diacritization from "./pages/Diacritization";
import SyntacticAnalysis from "./pages/SyntacticAnalysis";
import StandardSolutions from "./pages/StandardSolutions";
import Test from "./pages/Test";
import GiveFeedback from "./pages/GiveFeedback";
import SemanticAnalysis from "./pages/SemanticAnalysis";
import ViewFeedback from "./pages/ViewFeedback";
import "./App.css";
import { SessionProvider } from "./pages/Contexts/UploadContext";
import SemanticSolutions from "./pages/SemanticSolutions";



function App() {
  const [data, setData] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
      setIsLoggedIn(true);  // Set login state to true
      history("/home"); // Redirect to the home
    }
  };

  useEffect(() => {
    setTimeout(() => {
      DashboardValid();
      setData(true);
    }, 2000);
  }, []);

  return (
    <SessionProvider>
      {data ? (
        <>
          {isLoggedIn ? (
            <>
              <Header />
              <SideBar>
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/uploadtext" element={<UploadText />} />
                  <Route path="/diacritization" element={<Diacritization />} />
                  <Route path="/syntacticanalysis" element={<SyntacticAnalysis />} />
                  <Route path="/semanticanalysis" element={<SemanticAnalysis />} />
                  <Route path="/previousanalysis" element={<SemanticSolutions/>}/>
                  <Route path="/standardsolutions" element={<StandardSolutions />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/standardsolutions/givefeedback" element={<GiveFeedback />} />
                  <Route path="/viewfeedback" element={<ViewFeedback />} />
                </Routes>
              </SideBar>
            </>
          ) : (
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          )}
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
    </SessionProvider>
  );
}

export default App;
