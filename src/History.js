import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetch(`${BACKEND_URL}/room-history`, { credentials: "include" })
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

  // useEffect(() => {
  //   // fetch("http://localhost:4000/user-rooms",
  //   fetch("http://localhost:4000/user-rooms", { credentials: "include" })

  //     fetch("http://localhost:4000/room-history", 

  //      {
  //     credentials: "include",
  //   })
  //     .then((res) => res.json())
  //     .then((data) => setRooms(data));
  // }, []);

  return (
    <div className="history-container">
      <h2 className="page-title">📜 Your Past Collabs</h2>

      {rooms.length === 0 ? (
        <p className="empty-text">No rooms yet.</p>
      ) : (
        <div className="room-list">
          {rooms.map((room) => (
            <div key={room.roomId} className="room-card">
              <p className="room-id">
                Room ID: <strong>{room.roomId}</strong>
              </p>
              <p className="creator">
                👤 Created by: <strong>{room.creatorName || 'Unknown'}</strong>
              </p>
               <p className="created-at">
                🕒 Created on: <strong>{new Date(room.roomCreatedAt).toLocaleString()}</strong>
              </p>
              <button
                className="rejoin-btn"
                onClick={() => navigate(`/editor/${room.roomId}`)}
              >
                🔁 Rejoin Room
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .history-container {
          padding: 2rem;
          font-family: 'Segoe UI', sans-serif;
          min-height: 100vh;
          background: #f9fafb;
          color: #1f2937;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .room-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .room-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-left: 4px solid #3b82f6;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .room-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
        }

        .room-id {
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .creator {
          font-size: 0.95rem;
          margin-bottom: 1rem;
          color: #374151;
        }

        .rejoin-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .rejoin-btn:hover {
          background: #059669;
        }

        .empty-text {
          color: #9ca3af;
          font-size: 1rem;
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
