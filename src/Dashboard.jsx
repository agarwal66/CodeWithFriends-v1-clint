// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { v4 as uuidv4 } from 'uuid';
// import css from "./App.css"; // Import your CSS file
// export default function Dashboard() {
//   const [user, setUser] = useState(null);
//   const [joinCode, setJoinCode] = useState('');
//   const [rooms, setRooms] = useState([]);
//   const [darkMode, setDarkMode] = useState(true); // 🌙
//   const navigate = useNavigate();

//   // ✅ Fetch user profile
//   useEffect(() => {
//   fetch("http://localhost:4000/profile", {
//     credentials: "include",
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       if (data && data.displayName) {
//         setUser(data);
//         localStorage.setItem("user", JSON.stringify(data));
//       }
//     })
//     .catch(() => {
//       localStorage.removeItem("user"); // just in case
//     });
// }, []);


//   // ✅ Fetch rooms from MongoDB once user is loaded
//   useEffect(() => {
//     if (user) {
//       fetch("http://localhost:4000/user-rooms", {
//         credentials: "include",
//       })
//         .then((res) => res.json())
//         .then((data) => setRooms(data));
//     }
//   }, [user]);
//  const toggleTheme = () => setDarkMode(prev => !prev);
//   const logout = () => {
//     window.open("http://localhost:4000/auth/logout", "_self");
//   };

//   const createRoom = () => {
//     const roomId = uuidv4();
//     navigate(`/editor/${roomId}`);
//   };

//   const joinRoom = () => {
//     if (joinCode.trim() !== "") {
//       navigate(`/editor/${joinCode.trim()}`);
//     }
//   };

//   const handleJoinAgain = (roomId) => {
//     navigate(`/editor/${roomId}`);
//   };

//   if (!user) return <h3>Loading...</h3>;

//    return (
//   <div className={darkMode ? "dashboard-container dark" : "dashboard-container light"}>
//     <h2>Welcome, {user.displayName}</h2>
//     <img src={user.photos[0].value} alt="profile" width="80" />
//     <br /><br />
//     <button onClick={logout}>Logout</button>

//     <h3 style={{ marginTop: "30px" }}>Create or Join a Collab Room</h3>
//     <button onClick={createRoom}>➕ Create Collab Room</button>
//     <br /><br />
//     <input
//       type="text"
//       placeholder="Enter Collab Code"
//       value={joinCode}
//       onChange={(e) => setJoinCode(e.target.value)}
//     />
//     <button onClick={joinRoom}>🔗 Join Collab Room</button>
//     <button onClick={() => navigate('/history')}>View Past Collabs</button>
//     <button onClick={() => navigate('/history')}>📜 View Room History</button>

//     <hr />

//     <h3>Your Past Collaborations</h3>
//     {rooms.length === 0 ? (
//       <p>No rooms yet.</p>
//     ) : (
//       <ul>
//         {rooms.map((room) => (
//           <li key={room.roomId}>
//             <strong>{room.roomId}</strong> <br />
//             <button onClick={() => handleJoinAgain(room.roomId)}>
//               Join Again
//             </button>
//           </li>
//         ))}
//       </ul>
//     )}
//   </div>
// );


// }
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import css from "./App.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [rooms, setRooms] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch profile
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/profile`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        if (data?.displayName) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        } else {
          navigate("/");
        }
      })
      .catch(() => navigate("/"));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user) navigate("/");
    }, 7000);
    return () => clearTimeout(timeout);
  }, [user]);

  // ✅ Fetch grouped rooms from room_history
  useEffect(() => {
    if (user) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/user-rooms`,
        // "http://localhost:4000/user-rooms", 
        {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          const grouped = {};
          data.forEach(room => {
            const ts = new Date(room.timestamp).getTime();
            if (grouped[room.roomId]) {
              grouped[room.roomId].count += 1;
              grouped[room.roomId].latest = Math.max(grouped[room.roomId].latest, ts);
            } else {
              grouped[room.roomId] = {
                roomId: room.roomId,
                count: 1,
                latest: ts
              };
            }
          });
          const sorted = Object.values(grouped).sort((a, b) => b.latest - a.latest);
          setRooms(sorted);
        })
        .catch(err => console.error("Room fetch failed:", err));
    }
  }, [user]);

  const toggleTheme = () => setDarkMode(prev => !prev);
  const logout = () => window.open("http://localhost:4000/auth/logout", "_self");
  const createRoom = () => navigate(`/editor/${uuidv4()}`);
  const joinRoom = () => joinCode.trim() && navigate(`/editor/${joinCode.trim()}`);
  const handleJoinAgain = (roomId) => navigate(`/editor/${roomId}`);

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>⏳ Loading your dashboard...</h3>
        <p>If this takes too long, try refreshing or re-login.</p>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dashboard-container dark" : "dashboard-container light"}>
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
          cursor: "pointer"
        }}
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h2>👋 Welcome, {user.displayName}</h2>
      <img src={user.photos?.[0]?.value} alt="profile" width="80" style={{ borderRadius: '50%' }} />
      <br /><br />
      <button onClick={logout}>🚪 Logout</button>

      <h3 style={{ marginTop: "30px" }}>✨ Create or Join a Collab Room</h3>
      <button onClick={createRoom}>➕ Create Collab Room</button>
      <br /><br />
      <input
        type="text"
        placeholder="Enter Collab Code"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
        style={{ padding: "8px", borderRadius: "5px", width: "200px" }}
      />
      <button onClick={joinRoom}>🔗 Join Collab Room</button>
      <button onClick={() => navigate('/history')}>📜 View Room History</button>

      <hr />

      <h3>Your Past Collaborations</h3>
      {rooms.length === 0 ? (
        <p>No rooms yet.</p>
      ) : (
        <ul>
          {rooms.map((room, index) => (
            <li key={index} style={{ marginBottom: "16px" }}>
              <strong>Room ID:</strong> {room.roomId} <br />
              <strong>Times Used:</strong> {room.count} <br />
              <strong>Last Used:</strong> {new Date(room.latest).toLocaleString()} <br />
              <button onClick={() => handleJoinAgain(room.roomId)}>🔁 Rejoin Room</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
