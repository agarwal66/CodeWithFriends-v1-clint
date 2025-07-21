import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Button, HStack, Text, Center } from '@chakra-ui/react';

const VideoChat = ({ isVideoMuted = false, socket, roomId, user }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const stopVideoChat = useCallback(() => {
    setIsVideoStarted(false);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (socket) {
      socket.off('video-answer');
      socket.off('video-offer');
      socket.off('ice-candidate');
    }
  }, [socket]);

  const startVideoChat = useCallback(async () => {
    if (!socket || isVideoStarted || peerConnectionRef.current) return;

    setIsVideoStarted(true);
    setLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('video-offer', { roomId, offer });

      const handleAnswer = async ({ answer }) => {
        const pc = peerConnectionRef.current;
        if (pc && pc.signalingState !== 'closed') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      };

      const handleOffer = async ({ offer }) => {
        const pc = peerConnectionRef.current;
        if (pc && pc.signalingState !== 'closed') {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('video-answer', { roomId, answer });
        }
      };

      const handleCandidate = async ({ candidate }) => {
        const pc = peerConnectionRef.current;
        if (pc && pc.signalingState !== 'closed') {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn("ICE error:", e.message);
          }
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('ice-candidate', { roomId, candidate: e.candidate });
        }
      };

      socket.on('video-answer', handleAnswer);
      socket.on('video-offer', handleOffer);
      socket.on('ice-candidate', handleCandidate);

    } catch (err) {
      console.error("Error starting video:", err);
      stopVideoChat();
    } finally {
      setLoading(false);
    }

  }, [socket, roomId, isVideoStarted, stopVideoChat]);

  // Auto-start on load
  useEffect(() => {
    if (socket) startVideoChat();
    return () => stopVideoChat();
  }, [socket]);

  useEffect(() => {
    if (localVideoRef.current?.srcObject) {
      const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !isVideoMuted;
    }
  }, [isVideoMuted]);

  return (
    <Box
      p={3}
      bg="gray.800"
      borderRadius="md"
      mb={4}
      minH="280px" // 👈 Prevent layout flicker
      transition="all 0.3s ease"
    >
      <Text fontSize="md" fontWeight="bold" color="white" mb={2}>
        🎥 Video Chat - {user?.displayName}
      </Text>

      <HStack spacing={4} align="start" justify="center">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '250px', borderRadius: '8px', background: '#000' }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: '250px', borderRadius: '8px', background: '#000' }}
        />
      </HStack>

      <Center>
        <Button
          mt={3}
          size="sm"
          colorScheme="red"
          onClick={stopVideoChat}
          isDisabled={!isVideoStarted || loading}
        >
          🛑 Stop Video
        </Button>
      </Center>
    </Box>
  );
};

export default VideoChat;
