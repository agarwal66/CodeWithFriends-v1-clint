import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const accentIcons = [
  { src: "/logo.png", style: { top: "10%", left: "60%" } },
  { src: "/logo.png", style: { bottom: "15%", left: "52%" } },
  { src: "/logo.png", style: { top: "35%", right: "10%" } },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-bg unique-hero-bg">
      {/* Animated SVG or wavy background */}
      <svg className="hero-wave-bg" viewBox="0 0 1440 320">
        <path
          fill="#6e7ff3"
          fillOpacity="1"
          d="M0,224L48,208C96,192,192,160,288,133.3C384,107,480,85,576,101.3C672,117,768,171,864,186.7C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        ></path>
      </svg>
      <nav className="hero-nav">
        <div className="hero-logo" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="Logo" className="logo-img" />
          <span className="logo-text">CodeWithFriends</span>
        </div>
        <div className="hero-links">
          <button onClick={() => navigate("/about")}>About</button>
          <button onClick={() => navigate("/contact")}>Contact</button>
          <button onClick={() => navigate("/login")}>Get Started</button>
        </div>
      </nav>
      <div className="unique-hero-content">
        <div className="unique-hero-card">
          <h1>
            Code, <span className="hero-gradient">Collaborate</span>, <br />
            <span className="hero-gradient">Create</span>
          </h1>
          <p>
            The modern platform for real-time collaborative coding.<br />
            Build, learn, and grow together—anytime, anywhere.
          </p>
          <button className="hero-btn" onClick={() => navigate("/login")}>
            Get Started
          </button>
        </div>
        <div className="unique-hero-visual">
          <div className="unique-hero-illustration-glow">
            <img
              src="/illustration.gif"
              alt="Coding Illustration"
              className="hero-illustration-img"
              style={{
                background: "#fff",
                borderRadius: "22px",
                boxShadow: "0 8px 32px rgba(110,127,243,0.18)",
                maxWidth: "370px",
                width: "100%",
                height: "auto",
                objectFit: "cover",
                position: "relative",
                zIndex: 2
              }}
            />
            {/* Floating accent icons */}
            {accentIcons.map((icon, i) => (
              <img
                src={icon.src}
                alt=""
                key={i}
                className="floating-accent-icon"
                style={icon.style}
              />
            ))}
          </div>
        </div>
      </div>
      <footer className="hero-footer">
        © {new Date().getFullYear()} CodeWithFriends &middot; Built for coders
      </footer>
    </div>
  );
};

export default LandingPage;