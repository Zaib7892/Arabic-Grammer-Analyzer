import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./mix.css";

const Register = () => {
  const [passShow, setPassShow] = useState(false);
  const [cpassShow, setCPassShow] = useState(false);

  const [inpval, setInpval] = useState({
    fname: "",
    email: "",
    password: "",
    cpassword: "",
  });

  const setVal = (e) => {
    // console.log(e.target.value);
    const { name, value } = e.target;

    setInpval(() => {
      return {
        ...inpval,
        [name]: value,
      };
    });
  };

  const allowedDomains = [
    "gmail.com",
    "outlook.com",
    "yahoo.com",
    "icloud.com",
    "protonmail.com",
    "zoho.com",
    "aol.com",
    "gmx.com",
    "yandex.com",
    "mail.com",
  ];

  const addUserdata = async (e) => {
    e.preventDefault();

    const { fname, email, password, cpassword } = inpval;

    // Check if the email domain is valid
    const emailDomain = email.split("@")[1];
    if (!allowedDomains.includes(emailDomain)) {
      toast.warning("Only email addresses from specific domains are allowed!", {
        position: "top-center",
      });
      return;
    }

    // Check if the name is empty
    if (fname === "") {
      toast.warning("Full name is required!", {
        position: "top-center",
      });
    } else if (!/^[A-Za-z\s]+$/.test(fname)) {
      toast.warning("Name should only contain letters and spaces!", {
        position: "top-center",
      });
    }

    // Check if the email is empty
    else if (email === "") {
      toast.error("Email is required!", {
        position: "top-center",
      });
    }

    // Check if the email contains '@' and has a valid structure
    else if (!email.includes("@") || !email.includes(".")) {
      toast.warning("Please enter a valid email address!", {
        position: "top-center",
      });
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      toast.warning("Please enter a valid email address!", {
        position: "top-center",
      });
    }

    // Check if the password is empty
    else if (password === "") {
      toast.error("Password is required!", {
        position: "top-center",
      });
    }
    // Check if the password length is less than 6 characters
    else if (password.length < 6) {
      toast.error("Password must be at least 6 characters!", {
        position: "top-center",
      });
    }

    // Check if the confirm password is empty
    else if (cpassword === "") {
      toast.error("Confirm password is required!", {
        position: "top-center",
      });
    }
    // Check if the confirm password length is less than 6 characters
    else if (cpassword.length < 6) {
      toast.error("Confirm password must be at least 6 characters!", {
        position: "top-center",
      });
    }
    // Check if the password and confirm password match
    else if (password !== cpassword) {
      toast.error("Password and confirm password do not match!", {
        position: "top-center",
      });
    }
    // Ensure no previous validation failed before submitting data
    else {
      // Make an API call to register the user
      const data = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fname,
          email,
          password,
          cpassword,
        }),
      });

      const res = await data.json();

      // Handle successful registration
      if (res.status === 201) {
        toast.success("Registration successful 😃!", {
          position: "top-center",
        });
        setInpval({
          ...inpval,
          fname: "",
          email: "",
          password: "",
          cpassword: "",
        });
      }
      // Handle registration failure (for example, if email already exists)
      else if (res.status === 409) {
        toast.error("Email already exists. Please try a different one.", {
          position: "top-center",
        });
      } else {
        toast.error("Something went wrong. Please try again later.", {
          position: "top-center",
        });
      }
    }
  };

  return (
    <>
      <section>
        <div className="form_data">
          <div className="form_heading">
            <h1>Sign Up</h1>
            <p style={{ textAlign: "center" }}>Enter your credentials.</p>
          </div>

          <form>
            <div className="form_input">
              <label htmlFor="fname">Name</label>
              <input
                type="text"
                onChange={setVal}
                value={inpval.fname}
                name="fname"
                id="fname"
                placeholder="Enter Your Name"
              />
            </div>
            <div className="form_input">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                onChange={setVal}
                value={inpval.email}
                name="email"
                id="email"
                placeholder="Enter Your Email Address"
              />
            </div>
            <div className="form_input">
              <label htmlFor="password">Password</label>
              <div className="two">
                <input
                  type={!passShow ? "password" : "text"}
                  value={inpval.password}
                  onChange={setVal}
                  name="password"
                  id="password"
                  placeholder="Enter Your password"
                />
                <div
                  className="showpass"
                  onClick={() => setPassShow(!passShow)}
                >
                  {!passShow ? "Show" : "Hide"}
                </div>
              </div>
            </div>

            <div className="form_input">
              <label htmlFor="password">Confirm Password</label>
              <div className="two">
                <input
                  type={!cpassShow ? "password" : "text"}
                  value={inpval.cpassword}
                  onChange={setVal}
                  name="cpassword"
                  id="cpassword"
                  placeholder="Confirm password"
                />
                <div
                  className="showpass"
                  onClick={() => setCPassShow(!cpassShow)}
                >
                  {!cpassShow ? "Show" : "Hide"}
                </div>
              </div>
            </div>

            <button className="btn" onClick={addUserdata}>
              Sign Up
            </button>
            <p>
              Already have an account? <NavLink to="/">Log In</NavLink>
            </p>
          </form>
          <ToastContainer />
        </div>
      </section>
    </>
  );
};

export default Register;
