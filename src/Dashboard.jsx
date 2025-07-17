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

















import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import css from "./App.css";
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Input,
  Avatar,
  Image,
  SimpleGrid,
  HStack,
} from "@chakra-ui/react"; // ✅ Chakra UI import

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [rooms, setRooms] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch profile
  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_BACKEND_URL}/profile`, {
  //     method:"GET",
  //     credentials: "include",
  //   })
  //     .then((res) => {
  //       if (!res.ok) throw new Error("Not logged in");
  //       return res.json();
  //     })
  //     .then((data) => {
  //       if (data?.displayName) {
  //         setUser(data);
  //         localStorage.setItem("user", JSON.stringify(data));
  //       } else {
  //         navigate("/");
  //       }
  //     })
  //     .catch(() => navigate("/"));
  // }, []);
  useEffect(() => {
    const mockUser = {
      displayName: "Test User",
      photos: [{ value: "https://via.placeholder.com/80" }],
    };
    setUser(mockUser);
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
      fetch(
        `${process.env.REACT_APP_BACKEND_URL}/user-rooms`,
        // "http://localhost:4000/user-rooms",
        {
          credentials: "include",
        }
      )
        .then((res) => res.json())
        .then((data) => {
          const grouped = {};
          data.forEach((room) => {
            const ts = new Date(room.timestamp).getTime();
            if (grouped[room.roomId]) {
              grouped[room.roomId].count += 1;
              grouped[room.roomId].latest = Math.max(
                grouped[room.roomId].latest,
                ts
              );
            } else {
              grouped[room.roomId] = {
                roomId: room.roomId,
                count: 1,
                latest: ts,
              };
            }
          });
          const sorted = Object.values(grouped).sort(
            (a, b) => b.latest - a.latest
          );
          setRooms(sorted);
        })
        .catch((err) => console.error("Room fetch failed:", err));
    }
  }, [user]);

  const toggleTheme = () => setDarkMode((prev) => !prev);
  const logout = () =>
    window.open(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, "_self");
  const createRoom = () => navigate(`/editor/${uuidv4()}`);
  const joinRoom = () =>
    joinCode.trim() && navigate(`/editor/${joinCode.trim()}`);
  const handleJoinAgain = (roomId) => navigate(`/editor/${roomId}`);

  if (!user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>⏳ Loading your dashboard...</h3>
        <p>If this takes too long, try refreshing or re-login.</p>
      </div>
    );
  }

return (
  <Box bg={darkMode ? "gray.900" : "gray.50"} minH="100vh" p={6} color={darkMode ? "white" : "black"}>
    <Flex justify="space-between" align="center" mb={6}>
      <HStack>
        <Image src="/logo.png" boxSize="40px" />
        <Text fontSize="2xl" fontWeight="bold">CodeWithFriends</Text>
      </HStack>
      <Button onClick={logout} colorScheme="red" leftIcon={<span>⏻</span>}>Logout</Button>
    </Flex>

    <Flex align="center" mb={6}>
      <Avatar src={user.photos?.[0]?.value} name={user.displayName} mr={4} />
      <Box>
        <Text fontSize="xl">USER: {user.displayName}</Text>
        <Text fontSize="sm" color="gray.400">SYSTEM ACCESS GRANTED</Text>
      </Box>
    </Flex>

    <Box bg={darkMode ? "gray.800" : "white"} p={5} borderRadius="lg" mb={6} shadow="md">
      <Button onClick={toggleTheme}>{darkMode ? "Light Mode" : "Dark Mode"}</Button>
      <Text fontSize="lg" fontWeight="semibold" mb={4}>// COLLABORATION TERMINAL</Text>
      <Stack direction={{ base: "column", md: "row" }} spacing={4}>
        <Button colorScheme="blue" onClick={createRoom} leftIcon={<span>+</span>}>New Session</Button>
        <Input
          placeholder="Enter room code..."
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <Button colorScheme="green" onClick={joinRoom} leftIcon={<span>↗</span>}>Connect</Button>
        <Button onClick={() => navigate("/history")} leftIcon={<span>📜</span>}>Access Logs</Button>
      </Stack>
    </Box>

    <Box>
      <Text fontSize="lg" fontWeight="semibold" mb={3}>// ACTIVE SESSIONS</Text>
      {rooms.length === 0 ? (
        <Text>No active sessions detected.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          {rooms.map((room, index) => (
            <Box key={index} borderWidth="1px" borderRadius="md" p={4} bg={darkMode ? "gray.800" : "white"}>
              <Text fontWeight="bold">ID: {room.roomId}</Text>
              <HStack justify="space-between" mt={2}>
                <Box>
                  <Text fontSize="sm" color="gray.500">Access Count</Text>
                  <Text>{room.count}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Last Entry</Text>
                  <Text>{new Date(room.latest).toLocaleString()}</Text>
                </Box>
              </HStack>
              <Button mt={4} size="sm" colorScheme="teal" onClick={() => handleJoinAgain(room.roomId)}>
                ⟳ Re-establish Connection
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  </Box>
);
}