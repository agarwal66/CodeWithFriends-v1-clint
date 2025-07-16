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
import {
  Box, Flex, VStack, HStack, Text, Button, Select, Textarea, Input, Avatar,
  useColorMode, Tabs, TabList, TabPanels, Tab, TabPanel, IconButton, Spacer, Tag,
  useColorModeValue, useToast, Menu, MenuButton, MenuList, MenuItem, Divider
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import './App.css';

const MemoizedCodeMirror = memo(CodeMirror);

const MemoizedChat = memo(({ chat, user }) => {
  const chatRef = useRef(null);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);
  return (
    <VStack align="stretch" spacing={2} ref={chatRef} h="100%" overflowY="auto">
      {chat.map((msg, i) => (
        <Box
          key={i}
          bg={msg.sender === user?.displayName ? 'blue.500' : 'gray.700'}
          color="white"
          p={2}
          borderRadius="md"
        >
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

  const [code, setCode] = useState("// Start coding together!\n");
  const [typingUser, setTypingUser] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [languageId, setLanguageId] = useState(54);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVoiceStarted, setIsVoiceStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const { colorMode, toggleColorMode } = useColorMode();
  const inputBg = useColorModeValue("white", "gray.700");
  const inputColor = useColorModeValue("black", "white");
  const inputPlaceholder = useColorModeValue("gray.500", "gray.400");
  const boxBg = useColorModeValue("white", "gray.800");
  const panelBg = useColorModeValue("gray.100", "gray.900");

  const emitTyping = useCallback((username) => {
    if (socket.current) {
      socket.current.emit('user-typing', { roomId, username });
    }
  }, [roomId]);

  const handleChange = (value) => {
    setCode(value);
    if (socket.current) {
      socket.current.emit('send-code', { roomId, code: value });
      emitTyping(user?.displayName || "Someone");
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

  const startVoiceChat = () => {
    setIsVoiceStarted(true);
    toast({ title: '✅ Voice chat started', status: 'success', duration: 2000 });
  };

  const handleMute = () => {
    setIsMuted(prev => !prev);
    toast({
      title: isMuted ? 'Unmuted' : 'Muted',
      status: 'info',
      duration: 2000
    });
  };

  const handleStop = () => {
    setIsVoiceStarted(false);
    toast({ title: 'Voice chat ended', status: 'warning', duration: 2000 });
  };

  const leaveRoom = () => {
    if (socket.current) {
      socket.current.disconnect();
    }
    navigate("/dashboard");
  };

  useEffect(() => {
    socket.current = io(process.env.REACT_APP_API_URL, { transports: ['websocket'], withCredentials: true });
    socket.current.emit('join-room', {
      roomId,
      username: user?.displayName || "Anonymous",
      email: user?.emails?.[0]?.value,
    });
    socket.current.on('room-users', (users = []) => setActiveUsers(users));
    socket.current.on("code-update", setCode);
    socket.current.on("receive-message", ({ sender, message }) => setChat(prev => [...prev, { sender, message }]));
    socket.current.on('user-typing', (username) => {
      setTypingUser(username);
      setTimeout(() => setTypingUser(null), 1500);
    });
    fetch(`${process.env.REACT_APP_API_URL}/room/${roomId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.codeContent) setCode(data.codeContent);
        if (Array.isArray(data?.chatHistory)) setChat(data.chatHistory);
      });
    return () => socket.current && socket.current.disconnect();
  }, [roomId]);

  return (
    <Flex direction="column" minH="100vh" bg={boxBg}>
      <Flex px={6} py={3} bgGradient="linear(to-r, blue.700, purple.600)" align="center">
        <Text fontWeight="bold" fontSize="xl" color="white">Room ID: {roomId}</Text>
        <Spacer />
        <HStack spacing={3}>
          <Select value={languageId} onChange={e => setLanguageId(Number(e.target.value))} size="sm" w="120px" bg="white" color="black">
            <option value={54}>C++</option>
            <option value={62}>Java</option>
            <option value={71}>Python</option>
            <option value={63}>JavaScript</option>
          </Select>
          <Tag size="sm" colorScheme="green">Users: {activeUsers.length}</Tag>
          <Button onClick={leaveRoom} size="sm" colorScheme="red">Leave Room</Button>
          <Text color="white">{user?.displayName || 'Anonymous'}</Text>
          <Menu>
            <MenuButton><Avatar size="sm" name={user?.displayName} cursor="pointer" /></MenuButton>
            <MenuList fontSize="sm">
              <MenuItem><b>Name:</b> {user?.displayName || 'N/A'}</MenuItem>
              <MenuItem><b>Email:</b> {user?.emails?.[0]?.value || 'N/A'}</MenuItem>
            </MenuList>
          </Menu>
          <IconButton icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />} onClick={toggleColorMode} colorScheme="whiteAlpha" />
        </HStack>
      </Flex>

      <Flex flex="1" direction="row" p={4} gap={4}>
        <Flex direction="column" w={{ base: "100%", md: "25%" }} bg={panelBg} rounded="lg" p={3} shadow="md">
          <Text fontWeight="bold" mb={2}>💬 Chat</Text>
          <MemoizedChat chat={chat} user={user} />
          {typingUser && <Text fontSize="xs" color="gray.400">{typingUser} is typing...</Text>}
          <Input
            placeholder="Type your message..."
            bg={inputBg}
            color={inputColor}
            borderColor="gray.600"
            mt={2}
            _placeholder={{ color: inputPlaceholder }}
            onChange={e => setMessage(e.target.value)}
            value={message}
            onKeyDown={e => {
              if (e.key === 'Enter' && message.trim()) {
                socket.current.emit("send-message", { roomId, sender: user?.displayName, message });
                setMessage('');
              }
            }}
          />
          <Divider my={2} />
          <Text fontWeight="bold" mb={1}>👥 Active Users</Text>
          {activeUsers.map((u, idx) => <Text key={idx} fontSize="sm">• {u}</Text>)}
        </Flex>

        <Flex direction="column" w={{ base: "100%", md: "75%" }} gap={4}>
          <Box rounded="lg" bg={panelBg} p={3} shadow="md">
            <MemoizedCodeMirror
              value={code}
              height="300px"
              extensions={[javascript()]}
              onChange={handleChange}
              theme={colorMode === 'dark' ? 'dark' : 'light'}
            />
          </Box>

          <Tabs variant="enclosed" colorScheme="purple">
            <TabList>
              <Tab>Output</Tab>
              <Tab>Ask AI</Tab>
              <Tab>Voice</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Custom input..."
                  bg={inputBg}
                  color={inputColor}
                  borderColor="gray.600"
                  _placeholder={{ color: inputPlaceholder }}
                  mb={3}
                />
                <Box bg={boxBg} color={inputColor} p={3} rounded="md" fontFamily="mono">{output}</Box>
                <Button mt={3} colorScheme="blue">Run Code</Button>
              </TabPanel>
              <TabPanel>
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Paste error/code..."
                  bg={inputBg}
                  color={inputColor}
                  borderColor="gray.600"
                  _placeholder={{ color: inputPlaceholder }}
                />
                <Button mt={3} colorScheme="green" onClick={handleAskAI} isLoading={loading}>Fix It</Button>
                <Box mt={3} bg={boxBg} color="teal.200" p={2} rounded="md" fontFamily="mono">{aiResponse}</Box>
              </TabPanel>
              <TabPanel>
                <Button colorScheme="blue" onClick={startVoiceChat}>Start Voice Chat</Button>
                {isVoiceStarted && (
                  <HStack mt={3}>
                    <Tag colorScheme="green">✅ Voice Started</Tag>
                    <Button onClick={handleMute}>{isMuted ? 'Unmute' : 'Mute'}</Button>
                    <Button colorScheme="red" onClick={handleStop}>Stop</Button>
                  </HStack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Flex>

      <Box textAlign="center" fontSize="sm" p={3} bg={panelBg} color="gray.500">
        © {new Date().getFullYear()} Team Code. All rights reserved.
      </Box>
    </Flex>
  );
}


// Updated editor layout with theme switching, avatar dropdown, and working voice chat UI
