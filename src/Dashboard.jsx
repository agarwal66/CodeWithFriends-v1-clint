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
      method:"GET",
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
  const logout = () => window.open(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, "_self");
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
  <div className="dashboard-container dark">
    <button className="theme-toggle" onClick={toggleTheme}>
      {darkMode ? "☀️ TERMINAL MODE" : "🌙 CYBER MODE"}
    </button>
    <div className="dashboard-topbar">
  <img src="/logo.png" alt="logo" className="topbar-logo" />
  <h1 className="topbar-title">CodeWithFriends</h1>
</div>

    <header className="dashboard-header">
      <div className="user-info">
        <img src={user.photos?.[0]?.value} alt="profile" className="profile-pic" />
        <div>
          <h2>USER: {user.displayName}</h2>
          <p>SYSTEM ACCESS GRANTED</p>
        </div>
      </div>
      <button className="btn btn-primary" onClick={logout}>
        <span className="icon">⏻</span> LOGOUT
      </button>
    </header>

    <section className="action-section">
      <h3>// COLLABORATION TERMINAL</h3>
      <div className="button-group">
        <button className="btn btn-primary" onClick={createRoom}>
          <span className="icon">+</span> NEW SESSION
        </button>
        <input
          type="text"
          placeholder="ENTER ROOM CODE..."
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="room-input"
        />
        <button className="btn" onClick={joinRoom}>
          <span className="icon">↗</span> CONNECT
        </button>
        <button className="btn" onClick={() => navigate('/history')}>
          <span className="icon">📜</span> ACCESS LOGS
        </button>
      </div>
    </section>

    <section className="rooms-section">
      <h3>// ACTIVE SESSIONS</h3>
      {rooms.length === 0 ? (
        <div className="empty-state">
          <p>NO ACTIVE SESSIONS DETECTED</p>
        </div>
      ) : (
        <div className="room-list">
          {rooms.map((room, index) => (
            <div className="room-card" key={index}>
              <div className="room-id">ID: {room.roomId}</div>
              <div className="room-stats">
                <div className="stat">
                  <div className="stat-label">ACCESS COUNT</div>
                  <div className="stat-value">{room.count}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">LAST ENTRY</div>
                  <div className="stat-value">
                    {new Date(room.latest).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                className="btn-rejoin"
                onClick={() => handleJoinAgain(room.roomId)}
              >
                <span className="icon">⟳</span> RE-ESTABLISH CONNECTION
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
);
}