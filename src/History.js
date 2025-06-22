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
    <div>
      <h2>📜 Your Past Collabs</h2>
      {rooms.length === 0 ? (
        <p>No rooms yet.</p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <div key={room.roomId}>
              Room ID: <strong>{room.roomId}</strong> |
              {/* Created by: {room.createdBy} */}
              <strong> Created by:</strong> {room.creatorName || 'Unknown'}{" "}
              <button onClick={() => navigate(`/editor/${room.roomId}`)} style={{ marginLeft: '10px' }}>
                Rejoin
              </button>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}
