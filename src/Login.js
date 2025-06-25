// import React, { useState } from "react";
// import css from "./App.css"; // Import your CSS file
// export default function LoginPage() {
//   const [showEmailLogin, setShowEmailLogin] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
//   const handleGoogleLogin = () => {
//     window.open(`${BACKEND_URL}/auth/google`, "_self");
//   };

//   const handleEmailLogin = (e) => {
//     e.preventDefault();
//     // TODO: Replace with actual backend logic
//     alert(`Logging in with Email: ${email} and Password: ${password}`);
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <h2>👨‍💻 Welcome to Code With Friends</h2>

//         {!showEmailLogin ? (
//           <>
//             <button onClick={handleGoogleLogin} className="google-login-btn">
//               🔐 Login with Google
//             </button>
//             <p style={{ marginTop: "15px" }}>
//               or{" "}
//               <span
//                 onClick={() => setShowEmailLogin(true)}
//                 style={{ color: "#00f", cursor: "pointer", textDecoration: "underline" }}
//               >
//                 Login with Email
//               </span>
//             </p>
//           </>
//         ) : (
//           <>
//             <form onSubmit={handleEmailLogin}>
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="input-box"
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="input-box"
//               />
//               <button type="submit" className="email-login-btn">
//                 Login
//               </button>
//             </form>
//             <p style={{ marginTop: "15px" }}>
//               or{" "}
//               <span
//                 onClick={() => setShowEmailLogin(false)}
//                 style={{ color: "#00f", cursor: "pointer", textDecoration: "underline" }}
//               >
//                 Login with Google
//               </span>
//             </p>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import "./App.css"; // ✅ Your existing CSS
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function LoginPage() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleGoogleLogin = () => {
    window.open(`${BACKEND_URL}/auth/google`, "_self");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${BACKEND_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      alert("✅ Login successful!");
      window.location.href = "/dashboard";
    } catch (err) {
      alert("❌ Login failed: " + err.response?.data?.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/register`, {
        name,
        email,
        password,
      });
      alert("✅ Registration successful! You can now login.");
      setShowRegister(false);
    } catch (err) {
      alert("❌ Registration failed: " + err.response?.data?.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>👨‍💻 Welcome to Code With Friends</h2>

        {!showEmailLogin && !showRegister && (
          <>
            <button onClick={handleGoogleLogin} className="google-login-btn">
              🔐 Login with Google
            </button>
            <p style={{ marginTop: "15px" }}>
              or{" "}
              <span
                onClick={() => setShowEmailLogin(true)}
                style={{ color: "#00f", cursor: "pointer", textDecoration: "underline" }}
              >
                Login with Email
              </span>
            </p>
            <p style={{ marginTop: "10px" }}>
              Don't have an account?{" "}
              <span
                onClick={() => setShowRegister(true)}
                style={{ color: "#00f", cursor: "pointer", textDecoration: "underline" }}
              >
                Register
              </span>
            </p>
          </>
        )}

        {showEmailLogin && !showRegister && (
          <>
            <form onSubmit={handleEmailLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-box"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-box"
              />
              <button type="submit" className="email-login-btn">
                Login
              </button>
            </form>
            <p style={{ marginTop: "15px" }}>
              or{" "}
              <span
                onClick={() => setShowEmailLogin(false)}
                style={{ color: "#00f", cursor: "pointer", textDecoration: "underline" }}
              >
                Login with Google
              </span>
            </p>
          </>
        )}

        {showRegister && (
          <>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-box"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-box"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-box"
              />
              <button type="submit" className="email-login-btn">
                Register
              </button>
            </form>
            <p style={{ marginTop: "15px" }}>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setShowRegister(false);
                  setShowEmailLogin(true);
                }}
                style={{ color: "#00f", cursor: "pointer", textDecoration: "underline" }}
              >
                Login here
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}