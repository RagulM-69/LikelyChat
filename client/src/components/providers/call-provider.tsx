"use client";

import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { useSocket } from './socket-provider';
import { useUser } from '@/hooks/use-user';
import SimplePeer from 'simple-peer';

interface CallContextType {
    call: { isReceivingCall: boolean; from: string; name: string; signal: any } | null;
    callAccepted: boolean;
    callEnded: boolean;
    isCalling: boolean;
    userVideo: React.RefObject<HTMLVideoElement>;
    connectionRef: React.RefObject<SimplePeer.Instance | null>;
    myVideo: React.RefObject<HTMLVideoElement>;
    name: string;
    answerCall: () => void;
    callUser: (id: string) => void;
    leaveCall: () => void;
    stream: MediaStream | undefined;
    initiateVideo: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
    const { socket } = useSocket();
    const { user } = useUser();

    const [stream, setStream] = useState<MediaStream>();
    const [call, setCall] = useState<{ isReceivingCall: boolean; from: string; name: string; signal: any } | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [name, setName] = useState('');

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<SimplePeer.Instance | null>(null);

    useEffect(() => {
        if (!socket || !user) return;

        socket.on('callUser', ({ from, name: callerName, signal }: { from: string, name: string, signal: any }) => {
            setCall({ isReceivingCall: true, from, name: callerName, signal });
        });

        socket.on('endCall', () => {
            endCallCleanup();
        });

        return () => {
            socket.off('callUser');
            socket.off('endCall');
        };
    }, [socket, user]);

    const initiateVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            });
    };

    const answerCall = () => {
        setCallAccepted(true);
        setIsCalling(false);

        // Ensure stream is ready
        if (!stream) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((currentStream) => {
                    setStream(currentStream);
                    if (myVideo.current) {
                        myVideo.current.srcObject = currentStream;
                    }

                    const peer = new SimplePeer({
                        initiator: false,
                        trickle: false,
                        stream: currentStream,
                        config: {
                            iceServers: [
                                { urls: 'stun:stun.l.google.com:19302' },
                                { urls: 'stun:global.stun.twilio.com:3478' }
                            ]
                        }
                    });

                    peer.on('signal', (data) => {
                        socket?.emit('answerCall', { signal: data, to: call?.from });
                    });

                    peer.on('stream', (currentStream) => {
                        if (userVideo.current) {
                            userVideo.current.srcObject = currentStream;
                        }
                    });

                    peer.signal(call?.signal);
                    connectionRef.current = peer;
                });
            return;
        }

        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('signal', (data) => {
            socket?.emit('answerCall', { signal: data, to: call?.from });
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal(call?.signal);
        connectionRef.current = peer;
    };

    const callUser = (id: string) => {
        setIsCalling(true);
        setCallEnded(false);

        if (!stream) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((currentStream) => {
                    setStream(currentStream);
                    if (myVideo.current) {
                        myVideo.current.srcObject = currentStream;
                    }
                    startCallLogic(id, currentStream);
                });
            return;
        }
        startCallLogic(id, stream);
    };

    const startCallLogic = (id: string, currentStream: MediaStream) => {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: currentStream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('signal', (data) => {
            socket?.emit('callUser', {
                userToCall: id,
                signalData: data,
                from: user?._id,
                name: user?.username
            });
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        socket?.on('callAccepted', (signal: any) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);

        if (connectionRef.current) {
            connectionRef.current.destroy();
        }

        // Notify other user
        if (callAccepted && call?.from) {
            socket?.emit("endCall", { to: call.from });
        }

        endCallCleanup();
    };

    const endCallCleanup = () => {
        setCallAccepted(false);
        setCall(null);
        setIsCalling(false);

        // Stop stream tracks
        stream?.getTracks().forEach((track) => track.stop());
        setStream(undefined);

        // window.location.reload(); // Simplest way to clear signaling state issues for MVP
    }

    return (
        <CallContext.Provider value={{
            call,
            callAccepted,
            myVideo: myVideo as React.RefObject<HTMLVideoElement>,
            userVideo: userVideo as React.RefObject<HTMLVideoElement>,
            stream,
            name,
            callEnded,
            isCalling,
            callUser,
            leaveCall,
            answerCall,
            initiateVideo,
            connectionRef
        }}>
            {children}

            {/* Hidden Video Elements for Stream Management if no UI present */}
            {/* We will handle UI in a separate component, but refs are needed here or passed down */}
        </CallContext.Provider>
    );
};
