import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Button, Text, Center, VStack, SimpleGrid } from '@chakra-ui/react';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

const VideoChat = ({ socket, roomId, user }) => {
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isStarted, setIsStarted] = useState(false);

  // 🔁 Start local camera
  const startLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    localStreamRef.current = stream;
    setIsStarted(true);
    socket.emit('ready', { roomId });
  };

  const createPeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current[targetSocketId] = pc;

    // Add local tracks
    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    // Send ICE
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          target: targetSocketId,
          candidate: e.candidate,
        });
      }
    };

    // When remote track arrives
    pc.ontrack = (e) => {
      setRemoteStreams(prev => ({
        ...prev,
        [targetSocketId]: e.streams[0]
      }));
    };

    return pc;
  };

  const handleUserJoin = async ({ socketId }) => {
    console.log("👋 New user joined:", socketId);
    const pc = createPeerConnection(socketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('video-offer', {
      target: socketId,
      offer,
    });
  };

  const handleVideoOffer = async ({ from, offer }) => {
    const pc = createPeerConnection(from);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('video-answer', {
      target: from,
      answer,
    });
  };

  const handleVideoAnswer = async ({ from, answer }) => {
    const pc = peerConnectionsRef.current[from];
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = async ({ from, candidate }) => {
    const pc = peerConnectionsRef.current[from];
    if (!pc) return;
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const handleUserLeave = ({ socketId }) => {
    console.log("❌ User disconnected:", socketId);
    const pc = peerConnectionsRef.current[socketId];
    if (pc) pc.close();
    delete peerConnectionsRef.current[socketId];
    setRemoteStreams(prev => {
      const updated = { ...prev };
      delete updated[socketId];
      return updated;
    });
  };

  const stopVideoChat = () => {
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setRemoteStreams({});
    setIsStarted(false);
    socket.emit('leave-room', { roomId });
  };

  useEffect(() => {
  if (!socket) return;

  // Step 1: Join Room
  socket.emit('join-room', { roomId, username: user?.displayName });

  // Step 2: Get all users already connected in this room
  socket.on('all-users', async ({ users }) => {
    for (const userSocketId of users) {
      const pc = createPeerConnection(userSocketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('video-offer', {
        target: userSocketId,
        offer: pc.localDescription,
      });
    }
  });

  // Step 3: Listen for all signaling events
  socket.on('user-joined', handleUserJoin);
  socket.on('video-offer', handleVideoOffer);
  socket.on('video-answer', handleVideoAnswer);
  socket.on('ice-candidate', handleIceCandidate);
  socket.on('user-left', handleUserLeave);

  return () => {
    socket.off('all-users');
    socket.off('user-joined', handleUserJoin);
    socket.off('video-offer', handleVideoOffer);
    socket.off('video-answer', handleVideoAnswer);
    socket.off('ice-candidate', handleIceCandidate);
    socket.off('user-left', handleUserLeave);
  };
}, [socket, roomId]);

  return (
    <Box p={4} bg="gray.700" borderRadius="md" minH="300px" mb={4}>
      <Text fontSize="lg" color="white" mb={2}>
        🎥 Video Chat - {user?.displayName}
      </Text>

      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000' }}
        />
        {Object.entries(remoteStreams).map(([id, stream]) => (
          <video
            key={id}
            autoPlay
            playsInline
            style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000' }}
            ref={(el) => {
              if (el && stream) el.srcObject = stream;
            }}
          />
        ))}
      </SimpleGrid>

      <Center>
        {!isStarted ? (
          <Button mt={4} onClick={startLocalStream} colorScheme="green">
            ▶️ Start Video
          </Button>
        ) : (
          <Button mt={4} onClick={stopVideoChat} colorScheme="red">
            🛑 Stop Video
          </Button>
        )}
      </Center>
    </Box>
  );
};

export default VideoChat;
