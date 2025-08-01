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
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function LoginPage() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.open(`${BACKEND_URL}/auth/google`, "_self");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loginRes = await axios.post(
        `${BACKEND_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      console.log("Login response:", loginRes.data);
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/register`, {
        name,
        email,
        password,
      });
      alert("Registration successful! You can now login.");
      setShowRegister(false);
    } catch (err) {
      alert("Registration failed: " + err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
        <div className="logo">CodeWithFriends</div>
  <h1 className="welcome-text">
    {showRegister ? "Join the collab revolution" : "Welcome Back"}
  </h1>

          <p className="auth-subtitle">
            {showRegister
              ? "Get started with your account"
              : "Sign in to continue to your account"}
          </p>
        </div>

        {!showEmailLogin && !showRegister && (
          <div className="auth-body">
            <button onClick={handleGoogleLogin} className="btn-google">
              <span className="google-icon"></span>
              Continue with Google
            </button>
            <div className="divider">
              <span>or</span>
            </div>
            <button
              onClick={() => setShowEmailLogin(true)}
              className="btn-primary"
            >
              Continue with Email
            </button>
            <div className="auth-footer">
              Don't have an account?{" "}
              <button
                onClick={() => setShowRegister(true)}
                className="text-link"
              >
                Sign up
              </button>
            </div>
          </div>
        )}

        {(showEmailLogin || showRegister) && (
          <form
            onSubmit={showRegister ? handleRegister : handleEmailLogin}
            className="auth-form"
          >
            {showRegister && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder={showRegister ? "At least 8 characters" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                minLength={showRegister ? 8 : undefined}
              />
            </div>
            {!showRegister && (
              <div className="form-options">
                <button
                  type="button"
                  onClick={() => setShowEmailLogin(false)}
                  className="text-link"
                >
                  Use another method
                </button>
              </div>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : showRegister ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        )}

        {(showEmailLogin || showRegister) && (
          <div className="auth-footer">
            {showRegister ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setShowRegister(false);
                    setShowEmailLogin(true);
                  }}
                  className="text-link"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setShowRegister(true);
                    setShowEmailLogin(false);
                  }}
                  className="text-link"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}