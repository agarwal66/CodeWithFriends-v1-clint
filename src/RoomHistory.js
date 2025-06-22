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
    <div
      className={
        darkMode ? "dashboard-container dark" : "dashboard-container light"
      }
    >
      <button
        onClick={toggleTheme}
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          padding: "6px 12px",
          borderRadius: "8px",
          backgroundColor: darkMode ? "#333" : "#ddd",
          color: darkMode ? "#fff" : "#111",
          border: "1px solid gray",
          cursor: "pointer",
        }}
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h2>📜 Your Room History</h2>

      <button
        onClick={() => navigate("/dashboard")}
        style={{ marginBottom: "20px" }}
      >
        🔙 Back to Dashboard
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {rooms.length === 0 ? (
        <p>No room history available yet.</p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <div key={room.roomId}>
              Room ID: <strong>{room.roomId}</strong> |
              {/* Created by: {room.createdBy} */}
              <strong> Created by:</strong> {room.creatorName || "Unknown"}{" "}
              <button
                onClick={() => navigate(`/editor/${room.roomId}`)}
                style={{ marginLeft: "10px" }}
              >
                Rejoin
              </button>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}
