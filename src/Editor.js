// import React, { useEffect, useRef, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import CodeMirror from '@uiw/react-codemirror';
// import { javascript } from '@codemirror/lang-javascript';
// import './App.css'; // Import your CSS file
// export default function Editor() {
//   const { roomId } = useParams();
//   const user = JSON.parse(localStorage.getItem("user"));
//   const socket = useRef(null);

//   const [code, setCode] = useState("// Start coding together!\n");
//   const [typingUser, setTypingUser] = useState(null);
//   const [chat, setChat] = useState([]);
//   const [message, setMessage] = useState('');
// const [activeUsers, setActiveUsers] = useState([]);

//   const [languageId, setLanguageId] = useState(54);
//   const [input, setInput] = useState('');
//   const [output, setOutput] = useState('');

//   const localStreamRef = useRef(null);
//   const remoteAudioRef = useRef(null);
//   const peerConnectionRef = useRef(null);
//   const [isVoiceStarted, setIsVoiceStarted] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isVoiceConnected, setIsVoiceConnected] = useState(false);
//   const [darkMode, setDarkMode] = useState(true); // Dark mode state
//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
//   useEffect(() => {
//     socket.current = io(BACKEND_URL, {
//       transports: ['websocket'],
//       withCredentials: true,
//     });

//     socket.current.emit('join-room', {
//       roomId,
//       username: user?.displayName || "Anonymous",
//       email: user?.emails?.[0]?.value,
//     });
// socket.current.on('room-users', (users) => {
//   setActiveUsers(users);
// });

//     fetch(`${BACKEND_URL}/room/${roomId}`, { credentials: 'include' })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data?.codeContent) setCode(data.codeContent);
//         if (data?.chatHistory) setChat(data.chatHistory);
//       });
// socket.current.on("code-output", (output) => {
//     setOutput(output);
// });
//     socket.current.on('code-update', setCode);
//     socket.current.on("receive-message", ({ sender, message }) =>
//       setChat(prev => [...prev, { sender, message }])
//     );
    
//     socket.current.on('user-typing', (username) => {
//       setTypingUser(username);
//       setTimeout(() => setTypingUser(null), 1000);
//     });

//     return () => socket.current.disconnect();
//   }, [roomId]);

//   const handleChange = (value) => {
//     setCode(value);
//     socket.current.emit('send-code', { roomId, code: value });
//     socket.current.emit('user-typing', {
//       roomId,
//       username: user?.displayName || "Someone",
//     });
//   };

//   const runCode = async () => {
//     const res = await fetch(`${BACKEND_URL}/run-code`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ source_code: code, stdin: input, language_id: languageId,roomId: roomId }),
//     });
//     const result = await res.json();
//     setOutput(result.stdout || result.stderr || result.compile_output || "No output");
//   };

//   const startVoiceChat = async () => {
//     if (isVoiceStarted) return;
//         setIsVoiceStarted(true);
//     setIsVoiceConnected(true);

//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     localStreamRef.current = stream;

//     const pc = new RTCPeerConnection();
//     peerConnectionRef.current = pc;

//     stream.getTracks().forEach(track => pc.addTrack(track, stream));
//     pc.ontrack = (event) => remoteAudioRef.current.srcObject = event.streams[0];

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
//     socket.current.emit("voice-offer", { roomId, offer });

//     socket.current.on("voice-answer", async ({ answer }) => {
//       await pc.setRemoteDescription(new RTCSessionDescription(answer));
//     });

//     socket.current.on("voice-offer", async ({ offer }) => {
//       await pc.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       socket.current.emit("voice-answer", { roomId, answer });
//     });

//     pc.onicecandidate = (e) => {
//       if (e.candidate) {
//         socket.current.emit("ice-candidate", { roomId, candidate: e.candidate });
//       }
//     };

//     socket.current.on("ice-candidate", async ({ candidate }) => {
//       if (candidate) {
//         await pc.addIceCandidate(new RTCIceCandidate(candidate));
//       }
//     });

//     detectSpeaking(stream);
//   };

//   const handleMute = () => {
//     const audioTrack = localStreamRef.current?.getAudioTracks()[0];
//     if (audioTrack) {
//       audioTrack.enabled = isMuted;
//       setIsMuted(!isMuted);
//     }
//   };

//   const handleStop = () => {
//     localStreamRef.current?.getTracks().forEach(track => track.stop());
//     peerConnectionRef.current?.close();
//     remoteAudioRef.current.srcObject = null;
//     setIsVoiceStarted(false);
//   };

//   const detectSpeaking = (stream) => {
//     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//     const mic = audioContext.createMediaStreamSource(stream);
//     const analyser = audioContext.createAnalyser();
//     const dataArray = new Uint8Array(analyser.frequencyBinCount);

//     mic.connect(analyser);

//     const detect = () => {
//       analyser.getByteFrequencyData(dataArray);
//       const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
//       if (avg > 15 && !isSpeaking) {
//         setIsSpeaking(true);
//         setTimeout(() => setIsSpeaking(false), 2000);
//       }
//       requestAnimationFrame(detect);
//     };
//     detect();
//   };

//  return (
//   <div className={darkMode ? "editor-container dark" : "editor-container light"}>
//     <button
//       onClick={() => setDarkMode(!darkMode)}
//       style={{
//         position: 'absolute',
//         top: '10px',
//         right: '10px',
//         padding: '8px 16px',
//         borderRadius: '12px',
//         backgroundColor: darkMode ? '#2c2c2c' : '#eaeaea',
//         color: darkMode ? '#eaeaea' : '#2c2c2c',
//         border: '1px solid #555',
//         fontWeight: 'bold',
//         cursor: 'pointer'
//       }}
//     >
//       {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
//     </button>

//     <div className="header">
//       <h2 style={{ fontSize: '24px' }}>Room ID: {roomId}</h2>
//       {typingUser && <p style={{ color: '#888' }}>✍️ {typingUser} is editing...</p>}
//       {isSpeaking && <p style={{ color: '#fa5' }}>🔊 {user?.displayName || 'User'} is speaking...</p>}
//     </div>

//     <div className="section">
//       <h4>🟢 Active Users:</h4>
//       <ul className="active-users">
//         {activeUsers.map((u, i) => (
//           <li key={i}>{u}</li>
//         ))}
//       </ul>
//     </div>

//     <div className="code-editor">
//       <CodeMirror
//         value={code}
//         height="400px"
//         extensions={[javascript()]}
//         onChange={(val) => handleChange(val)}
//       />
//     </div>

//     <div className="chat-section">
//       <h3>💬 Chat</h3>
//       <div className="chat-box">
//         {chat.map((msg, i) => (
//           <p key={i}><strong>{msg.sender}:</strong> {msg.message}</p>
//         ))}
//       </div>
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter" && message.trim()) {
//             socket.current.emit("send-message", {
//               roomId,
//               sender: user?.displayName,
//               message,
//             });
//             setMessage('');
//             setChat(prev => [...prev, { sender: user?.displayName, message }]);
//           }
//         }}
//         placeholder="Type message and press Enter"
//         className="chat-input"
//       />
//     </div>

//     <div className="section">
//       <h3>🧠 Select Language</h3>
//       <select
//         value={languageId}
//         onChange={(e) => setLanguageId(Number(e.target.value))}
//         className="dropdown"
//       >
//         <option value={63}>JavaScript</option>
//         <option value={54}>C++</option>
//         <option value={62}>Java</option>
//         <option value={71}>Python</option>
//       </select>
//     </div>

//     <div className="section">
//       <h3>🎤 Voice Chat</h3>
//       <button className="voice-btn" onClick={startVoiceChat}>🔊 Start Voice Chat</button>
//       <audio ref={remoteAudioRef} autoPlay></audio>
//     </div>

//     {isVoiceStarted && (
//       <div className="voice-controls">
//         <button className="mute-btn" onClick={handleMute}>
//           {isMuted ? "🔇 Unmute" : "🎤 Mute"}
//         </button>
//         <button className="stop-btn" onClick={handleStop}>🛑 Stop</button>
//       </div>
//     )}

//     <div className="section">
//       <h3>⚙️ Custom Input</h3>
//       <textarea
//         rows={4}
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         placeholder="Enter input to pass to the code"
//         className="input-box"
//       />
//       <button className="run-btn" onClick={runCode}>▶️ Run Code</button>
//       <button className="leave-btn" onClick={() => {
//         socket.current.disconnect();
//         window.location.href = '/dashboard';
//       }}>🚪 Leave Room</button>

//       <h3>🧾 Output</h3>
//       <pre className="output-box">{output}</pre>
//     </div>
//   </div>
// );

// }
// Updated editor layout with theme switching, avatar dropdown, and working voice chat UI
// Updated Editor Component with improved Leave Room, Chat Layout, Typing Indicator, Language UI, and Active Users
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import throttle from 'lodash.throttle';
import { TextOperation } from './ot';
import { Tooltip } from "@chakra-ui/react";
import {
  Box, Flex, VStack, HStack, Text, Button, Select, Textarea, Input, Avatar,
  useColorMode, Tabs, TabList, TabPanels, Tab, TabPanel, IconButton, Spacer, Tag,
  useColorModeValue, useToast, Menu, MenuButton, MenuList, MenuItem
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

const MemoizedCodeMirror = memo(CodeMirror);

const MemoizedChat = memo(({ chat, user }) => {
  const chatRef = useRef(null);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);
  return (
  <VStack align="stretch" spacing={2} ref={chatRef} h="300px" overflowY="auto">
  {chat.map((msg, i) => (
    <Box key={i} bg={msg.sender === user?.displayName ? 'blue.500' : 'gray.700'} color="white" p={2} borderRadius="md">
      <Text fontSize="sm"><b>{msg.sender}:</b> {msg.message}</Text>
    </Box>
  ))}
</VStack>

  );
});

export default function Editor() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const socket = useRef(null);
  const toast = useToast();
const localStreamRef = useRef(null);
const remoteAudioRef = useRef(null);
const peerConnectionRef = useRef(null);
const [isVoiceStarted, setIsVoiceStarted] = useState(false);
const [isMuted, setIsMuted] = useState(false);
const [isSpeaking, setIsSpeaking] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [languageId, setLanguageId] = useState(() => {
    const saved = localStorage.getItem("editor_languageId");
    return saved !== null ? Number(saved) : 54;
  });
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(`editor_code_${languageId}`);
    return saved ?? "// Start coding together!\n";
  });
  useEffect(() => {
    localStorage.setItem(`editor_code_${languageId}`, code);
  }, [code, languageId]);
  
  useEffect(() => {
    localStorage.setItem("editor_languageId", languageId);
  }, [languageId]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const { colorMode, toggleColorMode } = useColorMode();
  const inputBg = useColorModeValue("white", "gray.700");
  const inputColor = useColorModeValue("black", "white");
const inputPlaceholder = useColorModeValue("gray.500", "gray.400");
const boxBg = useColorModeValue("white", "gray.800");
const panelBg = useColorModeValue("gray.100", "gray.900");
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const cmRef = useRef(null);
  const [editorMode, setEditorMode] = useState('ot'); // 'ot', 'classic1', 'classic2'

  const emitTyping = useCallback(
    (username) => {
      socket.current.emit('user-typing', { roomId, username });
    },
    [roomId]
  );

  // When user types:
  const handleChangeOT = (value, cmChange, cmInstance) => {
    setCode(value);
    // Save to server!
    socket.current.emit('code-update', { roomId, code: value });
    const op = TextOperation.fromCodeMirrorChanges(cmChange, cmInstance);
    socket.current.emit('send-op', { roomId, op: op.toJSON(), sender: socket.current.id });
    emitTyping(user?.displayName || "Someone");
  };

  // const handleChange = (value) => {
  //   setCode(value);
  //   socket.current.emit('send-code', { roomId, code: value });
  //   emitTyping(user?.displayName || "Someone");
  // };
  const handleChange = (value) => {
    setCode(value);
    socket.current.emit('send-code', {
      roomId,
      code: value,
      sender: socket.current.id, // Use the socket id!
    });
    emitTyping(user?.displayName || "Someone");
  };
  const handleOutputChange = useCallback(throttle((output) => {
    setOutput(output);
  }, 500), []);
   const runCode = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/run-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: code,
        stdin: input,
        language_id: languageId,
        roomId
      }),
    });

    const result = await res.json();

    if (result.stdout) {
      setOutput(result.stdout);
    } else if (result.stderr) {
      setOutput("❌ Runtime Error:\n" + result.stderr);
    } else if (result.compile_output) {
      setOutput("🛠 Compile Error:\n" + result.compile_output);
    } else {
      setOutput("⚠ No output or error received.");
    }
  } catch (err) {
    console.error("RunCode Error:", err);
    setOutput("❗ Failed to run code. Please check your connection or server logs.");
  }
};

  const handleAskAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://gemini-a.onrender.com/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setAiResponse(data.generatedText || "No response from AI.");
    } catch (error) {
      setAiResponse("⚠ Error communicating with AI.");
      toast({ title: 'AI Error', status: 'error', duration: 3000, isClosable: true });
    }
    setLoading(false);
  };

  const leaveRoom = () => {
    socket.current.disconnect();
    navigate("/dashboard");
  };

  useEffect(() => {
    socket.current = io(BACKEND_URL, { transports: ['websocket'], withCredentials: true });
    socket.current.on('connect', () => {
      console.log("Socket connected with id:", socket.current.id);
    });
    socket.current.on('op-update', ({ op, sender }) => {
      if (sender === socket.current.id) return;
      const operation = TextOperation.fromJSON(op);
      // Apply operation to CodeMirror (not setCode)
      if (cmRef.current && cmRef.current.applyOperation) {
        cmRef.current.applyOperation(operation);
        // After applying the OT operation, update React state with the latest code:
        const latestCode = cmRef.current.getValue();
        console.log("Latest code from CodeMirror:", latestCode);
        setCode(latestCode);
        socket.current.emit('code-update', { roomId, code: latestCode });
      }
    });
    socket.current.emit('join-room', {
      roomId,
      username: user?.displayName || "Anonymous",
      email: user?.emails?.[0]?.value,
    });
    socket.current.on('init-code', (latestCode) => {
      setCode(latestCode);
    });
    socket.current.on("code-output", handleOutputChange);
    socket.current.on('room-users', (users = []) => setActiveUsers(users));
    // socket.current.on("code-update", setCode);
    socket.current.on("code-update", ({ code: newCode, sender }) => {
      if (sender === socket.current.id) return; // Ignore own update
      setCode(prevCode => (prevCode !== newCode ? newCode : prevCode));
    });
    socket.current.on("receive-message", ({ sender, message }) => setChat(prev => [...prev, { sender, message }]));
    socket.current.on('user-typing', (username) => {
      setTypingUser(username);
      setTimeout(() => setTypingUser(null), 3000);
    });

    fetch(`${BACKEND_URL}/room/${roomId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.codeContent) setCode(data.codeContent);
        if (Array.isArray(data?.chatHistory)) setChat(data.chatHistory);
      });

    return () => socket.current && socket.current.disconnect();
  }, [roomId]);
  
  const startVoiceChat = async () => {
    if (isVoiceStarted || peerConnectionRef.current) return;
    setIsVoiceStarted(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;

    const pc = new RTCPeerConnection();
    peerConnectionRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0];
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.current.emit("voice-offer", { roomId, offer });

    socket.current.on("voice-answer", async ({ answer }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.current.on("voice-offer", async ({ offer }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.current.emit("voice-answer", { roomId, answer });
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.current.emit("ice-candidate", { roomId, candidate: e.candidate });
      }
    };

    socket.current.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    detectSpeaking(stream);
  };

  const handleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleStop = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    remoteAudioRef.current.srcObject = null;
    setIsVoiceStarted(false);
  };

  const detectSpeaking = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mic = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    mic.connect(analyser);

    const detect = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      if (avg > 15 && !isSpeaking) {
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 2000);
      }
      requestAnimationFrame(detect);
    };
    detect();
  };
  const handleLanguageChange = (newLangId) => {
    // Save current code to its language slot
    localStorage.setItem(`editor_code_${languageId}`, code);
  
    // Get code for the new language, if any
    let newCode = localStorage.getItem(`editor_code_${newLangId}`);
  
    if (code.trim() !== "" && code.trim() !== "// Start coding together!") {
      const confirmChange = window.confirm(
        "Changing the language will erase your current code. Do you want to continue?"
      );
      if (!confirmChange) return;
  
      // Only reset if there is NO code for the new language yet
      if (!newCode) {
        newCode = ""; // or your template
        localStorage.setItem(`editor_code_${newLangId}`, "");
        if (editorMode === "ot") {
          socket.current.emit('code-update', { roomId, code: "" });
        }
      }
      // If there IS code for the new language, just load it (don't reset)
    }
  
    setLanguageId(newLangId);
    setCode(newCode ?? ""); // If newCode is null, set to empty string
  };
 
  return (
  <Flex direction="column" minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
    <Flex px={6} py={3} bg="blue.600" align="center">
      <Text fontWeight="bold" fontSize="xl" color="white">Room ID: {roomId}</Text>
      <Spacer />
      <HStack spacing={3}>
      <select
  value={languageId}
  onChange={(e) => handleLanguageChange(Number(e.target.value))}
  className="dropdown"
  style={{
    width: "110px",       // or try 90px, 100px as needed
    fontSize: "0.95rem",  // reduce font size
    padding: "2px 6px",   // reduce padding for a more compact look
    borderRadius: "6px"   // optional, for a modern look
  }}
>
  <option value={63}>JavaScript</option>
  <option value={54}>C++</option>
  <option value={62}>Java</option>
  <option value={71}>Python</option>
</select>
        <Tag size="sm" colorScheme="green">Users: {activeUsers.length}</Tag>
        <Button onClick={leaveRoom} size="sm" colorScheme="red">Leave Room</Button>
        <Text color="white">{user?.displayName || 'Anonymous'}</Text>
        <Menu>
          <MenuButton>
            <Avatar size="sm" name={user?.displayName} cursor="pointer" />
          </MenuButton>
          <MenuList fontSize="sm">
            <MenuItem><b>Name:</b> {user?.displayName || 'N/A'}</MenuItem>
            <MenuItem><b>Email:</b> {user?.emails?.[0]?.value || 'N/A'}</MenuItem>
          </MenuList>
        </Menu>
        <IconButton icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />} onClick={toggleColorMode} />
      </HStack>
    </Flex>

    <Flex flex="1" direction="row" p={4} gap={4}>
      {/* Chat and Users Sidebar */}
      <Flex direction="column" w={{ base: "100%", md: "25%" }} bg="gray.800" rounded="lg" p={3} shadow="md">
        <Text fontWeight="bold" mb={2} color="white">💬 Chat</Text>
        <Box flex="1" overflowY="auto" mb={2}>
    <MemoizedChat chat={chat} user={user} />
  </Box>
    {typingUser && (
    <Text fontSize="sm" color="yellow.400" mb={1}>
    📝 {typingUser} is typing...
    </Text>
)}

        <Input
          placeholder="Type your message..."
          bg={inputBg}
          color={inputColor}
          mt={2}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && message.trim()) {
              socket.current.emit("send-message", {
                roomId,
                sender: user?.displayName,
                message,
              });
              setMessage('');
              setChat(prev => [...prev, { sender: user?.displayName, message }]);
            }
          }}
        />
        <Text fontWeight="bold" mt={3} color="white">👥 Active Users</Text>
        {activeUsers.map((u, idx) => (
  <Text key={idx} fontSize="sm" color="gray.300">• {u}</Text>
))}

      </Flex>

      {/* Code + Tabs Section */}
      <Flex direction="column" w={{ base: "100%", md: "75%" }} gap={4}>
        {/* Code Editor */}
        <Box rounded="lg" bg="gray.800" p={3} shadow="md">
        <HStack mb={2}>
  <Tooltip
    label={
      <div>
        <b>OT Mode:</b> <br />
        Real-time, safe collaboration.<br />
        Multiple users can edit together, no data loss, smooth merging.
      </div>
    }
    placement="right"
    hasArrow
    bg="gray.700"
    color="white"
    p={3}
    borderRadius="md"
    fontSize="sm"
  >
    <Button
      size="sm"
      colorScheme={editorMode === 'ot' ? 'blue' : 'gray'}
      onClick={() => setEditorMode('ot')}
    >
      OT Mode
    </Button>
  </Tooltip>
  <Tooltip
    label={
      <div>
        <b>Classic Mode:</b> <br />
        Simple real-time updates.<br />
        Not safe for teamwork—changes can be lost if many people type together.
      </div>
    }
    placement="right"
    hasArrow
    bg="gray.700"
    color="white"
    p={3}
    borderRadius="md"
    fontSize="sm"
  >
    <Button
      size="sm"
      colorScheme={editorMode === 'classic' ? 'blue' : 'gray'}
      onClick={() => setEditorMode('classic')}
    >
      Classic Mode
    </Button>
  </Tooltip>
</HStack>
          <MemoizedCodeMirror
            value={code}
            height="300px"
            extensions={[javascript()]}
            // onChange={handleChange}
            onChange={editorMode === 'ot' ? handleChangeOT : handleChange}
            theme={colorMode === 'dark' ? 'dark' : 'light'}
            editorDidMount={(editorView) => { cmRef.current = editorView; }}
          />
        </Box>

        {/* Tabs */}
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList>
            <Tab>Output</Tab>
            <Tab>Ask AI</Tab>
          </TabList>
          <TabPanels>
            {/* Output Tab */}
            <TabPanel>
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Custom input..."
                bg={inputBg}
                color={inputColor}
                mb={3}
              />
              <Box bg="gray.700" color="white" p={3} rounded="md" fontFamily="mono">{output}</Box>
              <Button mt={3} colorScheme="blue" onClick={runCode}>Run Code</Button>
            </TabPanel>

            {/* Ask AI Tab */}
            <TabPanel>
              <Box bg={boxBg} p={4} borderRadius="md" shadow="md">
                <Text fontSize="lg" fontWeight="bold" mb={2}>🧠 Ask AI for Help</Text>
                <Textarea
                  placeholder="Paste your error or code..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  bg={inputBg}
                  color={inputColor}
                  borderColor="gray.600"
                  _placeholder={{ color: inputPlaceholder }}
                  mb={3}
                />
                <Button
                  onClick={handleAskAI}
                  isLoading={loading}
                  colorScheme="green"
                  width="100%"
                >
                  Fix It
                </Button>
                {aiResponse !== '' && (
                  <Box
                    mt={4}
                    bg="gray.900"
                    color="teal.100"
                    p={3}
                    borderRadius="md"
                    fontFamily="mono"
                    whiteSpace="pre-wrap"
                  >
                    {aiResponse}
                  </Box>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Voice Chat Controls (below tabs) */}
       {isVoiceStarted ? (
      <Box mt={4} bg="green.800" p={3} rounded="md" shadow="md" border="1px solid #38A169">
      <HStack spacing={4} align="center">
      <Text color="green.200" fontWeight="bold" fontSize="md">✅ Voice Chat Activated</Text>
      {isSpeaking && (
        <Text color="yellow.300" fontWeight="semibold">🗣 {user?.displayName} is speaking...</Text>
      )}
      <Spacer />
      <Button size="sm" onClick={handleMute} colorScheme="yellow">
        {isMuted ? '🔇 Unmute' : '🎤 Mute'}
        </Button>
        <Button size="sm" colorScheme="red" onClick={handleStop}>
        🛑 Stop
        </Button>
        <audio ref={remoteAudioRef} autoPlay />
      </HStack>
    </Box>
    ) : (
    <Button mt={3} onClick={startVoiceChat} colorScheme="purple">
      🎙 Start Voice Chat
    </Button>
)}
      </Flex>
    </Flex>
  </Flex>
);
}