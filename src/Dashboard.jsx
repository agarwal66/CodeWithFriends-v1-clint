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

















import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import {
  AppBar, Toolbar, Typography, IconButton, Button, TextField, Avatar, Box, CssBaseline,
  Container, Stack, Card, CardContent, Grid, Paper, useTheme, ThemeProvider, createTheme, Tooltip, Divider,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import SyncIcon from '@mui/icons-material/Sync';
import SendIcon from '@mui/icons-material/Send';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [rooms, setRooms] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  // THEME
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: '#007aff',
        },
        background: {
          default: darkMode ? "#151925" : "#f5f5f5",
          paper: darkMode ? "#23283b" : "#fff",
        }
      },
      shape: { borderRadius: 16 },
    }), [darkMode]
  );

  // Profile fetch
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/profile`, {
      method: "GET",
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

  // Fetch grouped rooms from room_history
  useEffect(() => {
    if (user) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/user-rooms`, {
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
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6">⏳ Loading your dashboard...</Typography>
          <Typography>If this takes too long, try refreshing or re-login.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar color="default" elevation={1} position="static">
        <Toolbar>
          <Box mr={2} sx={{ display: "flex", alignItems: "center" }}>
            <img src="/logo.png" alt="logo" style={{ height: 38, marginRight: 12, borderRadius: 7 }} />
          </Box>
          <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
            CodeWithFriends
          </Typography>

          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} arrow>
            <IconButton color="primary" onClick={toggleTheme}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout" arrow>
            <IconButton color="secondary" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
        {/* User header */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={2}>
            <Avatar
              src={user.photos?.[0]?.value}
              sx={{ width: 68, height: 68 }}
            />
            <Box>
              <Typography variant="h5">USER: {user.displayName}</Typography>
              <Typography color="primary" variant="subtitle2">SYSTEM ACCESS GRANTED</Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Collaboration/Action Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>// COLLABORATION TERMINAL</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Button
              startIcon={<AddIcon />}
              onClick={createRoom}
              variant="contained"
              color="primary"
            >NEW SESSION</Button>

            <TextField
              label="Enter Room Code"
              size="small"
              variant="outlined"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && joinRoom()}
              sx={{ flex: 1, minWidth: 180 }}
            />

            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={joinRoom}
              color="secondary"
              disabled={!joinCode.trim()}
            >CONNECT</Button>

            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/history')}
            >ACCESS LOGS</Button>
          </Stack>
        </Paper>

        {/* Active Sessions */}
        <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6">// ACTIVE SESSIONS</Typography>
          <Divider sx={{ my: 2 }} />
          {rooms.length === 0 ? (
            <Typography py={5} textAlign="center" color="text.secondary">
              NO ACTIVE SESSIONS DETECTED
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {rooms.map((room, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card
                    sx={{
                      minHeight: 170,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 2,
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        ID: {room.roomId}
                      </Typography>
                      <Typography variant="body2">
                        <b>ACCESS COUNT:</b> {room.count}<br />
                        <b>LAST ENTRY:</b> {new Date(room.latest).toLocaleString()}
                      </Typography>
                    </CardContent>
                    <Box textAlign="right" pb={1}>
                      <Button
                        variant="contained"
                        color="info"
                        endIcon={<SyncIcon />}
                        onClick={() => handleJoinAgain(room.roomId)}
                      >
                        RE-ESTABLISH CONNECTION
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
