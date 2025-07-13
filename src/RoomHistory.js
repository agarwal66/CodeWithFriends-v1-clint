import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoomHistory() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetch(`${BACKEND_URL}/history`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRooms(data);
        } else {
          console.error("Unexpected data format", data);
          setRooms([]);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setRooms([]);
      });
  }, []);

  const handleRejoin = (roomId) => {
    navigate(`/editor/${roomId}`);
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <div className={`room-history-container ${darkMode ? "dark" : "light"}`}>
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h2 className="page-title">📜 Your Room History</h2>

      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        🔙 Back to Dashboard
      </button>

      {error && <p className="error-text">{error}</p>}

      {rooms.length === 0 ? (
        <p className="empty-text">No room history available yet.</p>
      ) : (
        <div className="room-list">
          {rooms.map((room) => (
            <div key={room.roomId} className="room-card">
              <p className="room-id">
                Room ID: <strong>{room.roomId}</strong>
              </p>
              <p className="creator">
                👤 Created by: <strong>{room.creatorName || "Unknown"}</strong>
              </p>
              <button
                className="rejoin-btn"
                onClick={() => handleRejoin(room.roomId)}
              >
                🔁 Rejoin Room
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Embedded CSS */}
      <style jsx>{`
        .room-history-container {
          padding: 2rem;
          min-height: 100vh;
          font-family: 'Segoe UI', sans-serif;
          transition: background 0.3s, color 0.3s;
        }

        .room-history-container.light {
          background: #f9fafb;
          color: #1f2937;
        }

        .room-history-container.dark {
          background: #1e1e1e;
          color: #e0e0e0;
        }

        .theme-toggle {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid #999;
          background-color: #444;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
        }

        .room-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .room-card {
          background: #ffffff10;
          backdrop-filter: blur(8px);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #3b82f6;
        }

        .dark .room-card {
          background: #2c2c2c;
          border-left-color: #60a5fa;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .back-btn {
          background: #3b82f6;
          color: white;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 1.5rem;
        }

        .rejoin-btn {
          margin-top: 1rem;
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .rejoin-btn:hover {
          background: #059669;
        }

        .error-text {
          color: #f87171;
        }

        .empty-text {
          color: #9ca3af;
          font-size: 1rem;
          text-align: center;
        }

        @media (max-width: 600px) {
          .room-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
