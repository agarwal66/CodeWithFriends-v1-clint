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




import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
// import debounce from 'lodash.debounce';
// import throttle from 'lodash.throttle';
import { debounce, throttle } from 'lodash';

import './App.css';

const MemoizedCodeMirror = memo(CodeMirror);
const MemoizedChat = memo(({ chat }) => (
  <div className="chat-box">
    {chat.map((msg, i) => (
      <p key={i}><strong>{msg.sender}:</strong> {msg.message}</p>
    ))}
  </div>
));

export default function Editor() {
  const { roomId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const socket = useRef(null);

  const [code, setCode] = useState("// Start coding together!\n");
  const [typingUser, setTypingUser] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [languageId, setLanguageId] = useState(54);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [isVoiceStarted, setIsVoiceStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const emitTyping = useCallback(debounce((username) => {
    socket.current.emit('user-typing', { roomId, username });
  }, 300), [roomId]);

  const handleChange = (value) => {
    setCode(value);
    socket.current.emit('send-code', { roomId, code: value });
    emitTyping(user?.displayName || "Someone");
  };

  const handleOutputChange = useCallback(throttle((output) => {
    setOutput(output);
  }, 500), []);

  useEffect(() => {
    socket.current = io(BACKEND_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.current.emit('join-room', {
      roomId,
      username: user?.displayName || "Anonymous",
      email: user?.emails?.[0]?.value,
    });

    socket.current.on('room-users', (users) => {
      setActiveUsers((prevUsers) => {
        const isSame = users.length === prevUsers.length &&
          users.every((u, i) => u === prevUsers[i]);
        if (!isSame) return users;
        return prevUsers;
      });
    });

    fetch(`${BACKEND_URL}/room/${roomId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.codeContent) setCode(data.codeContent);
        if (data?.chatHistory) setChat(data.chatHistory);
      });

    socket.current.on("code-output", handleOutputChange);
    socket.current.on("code-update", setCode);
    socket.current.on("receive-message", ({ sender, message }) =>
      setChat(prev => [...prev, { sender, message }])
    );

    socket.current.on('user-typing', (username) => {
      setTypingUser(username);
      setTimeout(() => setTypingUser(null), 1000);
    });

    return () => socket.current.disconnect();
  }, [roomId, user?.displayName, handleOutputChange]);

  const runCode = async () => {
    const res = await fetch(`${BACKEND_URL}/run-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_code: code, stdin: input, language_id: languageId, roomId }),
    });
    const result = await res.json();
    setOutput(result.stdout || result.stderr || result.compile_output || "No output");
  };

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

  return (
    <div className={darkMode ? "editor-container dark" : "editor-container light"}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '8px 16px',
          borderRadius: '12px',
          backgroundColor: darkMode ? '#2c2c2c' : '#eaeaea',
          color: darkMode ? '#eaeaea' : '#2c2c2c',
          border: '1px solid #555',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="header">
        <h2>Room ID: {roomId}</h2>
        {typingUser && <p>✍️ {typingUser} is editing...</p>}
        {isSpeaking && <p>🔊 {user?.displayName || 'User'} is speaking...</p>}
      </div>

      <div className="section">
        <h4>🟢 Active Users:</h4>
        <ul className="active-users">
          {activeUsers.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </div>

      <div className="code-editor">
        <MemoizedCodeMirror
          value={code}
          height="400px"
          extensions={[javascript()]}
          onChange={(val) => handleChange(val)}
        />
      </div>

      <div className="chat-section">
        <h3>💬 Chat</h3>
        <MemoizedChat chat={chat} />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
          placeholder="Type message and press Enter"
          className="chat-input"
        />
      </div>

      <div className="section">
        <h3>🧠 Select Language</h3>
        <select
          value={languageId}
          onChange={(e) => setLanguageId(Number(e.target.value))}
          className="dropdown"
        >
          <option value={63}>JavaScript</option>
          <option value={54}>C++</option>
          <option value={62}>Java</option>
          <option value={71}>Python</option>
        </select>
      </div>

      <div className="section">
        <h3>🎤 Voice Chat</h3>
        <button className="voice-btn" onClick={startVoiceChat}>🔊 Start Voice Chat</button>
        <audio ref={remoteAudioRef} autoPlay></audio>
      </div>

      {isVoiceStarted && (
        <div className="voice-controls">
          <button className="mute-btn" onClick={handleMute}>
            {isMuted ? "🔇 Unmute" : "🎤 Mute"}
          </button>
          <button className="stop-btn" onClick={handleStop}>🛑 Stop</button>
        </div>
      )}

      <div className="section">
        <h3>⚙️ Custom Input</h3>
        <textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter input to pass to the code"
          className="input-box"
        />
        <button className="run-btn" onClick={runCode}>▶️ Run Code</button>
        <button className="leave-btn" onClick={() => {
          socket.current.disconnect();
          window.location.href = '/dashboard';
        }}>🚪 Leave Room</button>

        <h3>🧾 Output</h3>
        <pre className="output-box">{output}</pre>
      </div>
    </div>
  );
}


