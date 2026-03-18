import { useCallback, useRef, useState } from "react";
import type { CallType } from "@/services/webrtcSignaling";

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function useWebRTC(iceServers: RTCIceServer[] = DEFAULT_ICE_SERVERS) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new");

  const createPeerConnection = useCallback(
    (onIceCandidate: (candidate: RTCIceCandidateInit) => void) => {
      const pc = new RTCPeerConnection({ iceServers });
      pc.onicecandidate = (event) => {
        if (event.candidate) onIceCandidate(event.candidate.toJSON());
      };
      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) setRemoteStream(stream);
      };
      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
      };
      pcRef.current = pc;
      return pc;
    },
    [iceServers]
  );

  const startCaller = useCallback(
    async (callType: CallType, onIceCandidate: (c: RTCIceCandidateInit) => void, onOfferReady: (offer: RTCSessionDescriptionInit) => void) => {
      const pc = createPeerConnection(onIceCandidate);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      setLocalStream(stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      onOfferReady(offer);
    },
    [createPeerConnection]
  );

  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit, callType: CallType, onIceCandidate: (c: RTCIceCandidateInit) => void, onAnswerReady: (answer: RTCSessionDescriptionInit) => void) => {
      const pc = createPeerConnection(onIceCandidate);
      await pc.setRemoteDescription(offer);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      setLocalStream(stream);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      onAnswerReady(answer);
    },
    [createPeerConnection]
  );

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    const pc = pcRef.current;
    if (!pc) return;
    await pc.setRemoteDescription(answer);
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current;
    if (!pc) return;
    await pc.addIceCandidate(candidate);
  }, []);

  const endCall = useCallback(() => {
    const pc = pcRef.current;
    if (pc) pc.close();
    pcRef.current = null;
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState("new");
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    connectionState,
    startCaller,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    endCall,
  };
}
