"use client";

import { useEffect, useState } from "react";
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCall } from "@/components/providers/call-provider";
import { cn } from "@/lib/utils";

export function VideoCallModal() {
    const {
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        callEnded,
        answerCall,
        leaveCall,
        isCalling
    } = useCall()!;

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (call?.isReceivingCall && !callAccepted) {
            setIsOpen(true);
        } else if (isCalling || callAccepted) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [call, isCalling, callAccepted]);

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !micOn;
            setMicOn(!micOn);
        }
    };

    const toggleCam = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !camOn;
            setCamOn(!camOn);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="relative w-full max-w-4xl h-[80vh] bg-cosmic-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 z-10 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-2 rounded-full backdrop-blur-md border border-green-500/30">
                            <Video className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg shadow-black drop-shadow-md">
                                {callAccepted ? "Connected" : (isCalling ? "Calling..." : `Incoming Call via ${call?.name}`)}
                            </h3>
                            <p className="text-gray-300 text-xs shadow-black drop-shadow-md">End-to-End Encrypted</p>
                        </div>
                    </div>
                </div>

                {/* Video Area */}
                <div className="flex-1 relative bg-black flex items-center justify-center">
                    {/* Remote Video (Main) */}
                    {callAccepted && !callEnded && (
                        <video
                            playsInline
                            ref={userVideo}
                            autoPlay
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Local Video (Floating or Main if waiting) */}
                    {(stream) && (
                        <div className={cn(
                            "absolute overflow-hidden rounded-xl border border-white/20 shadow-xl transition-all duration-300 bg-gray-900",
                            callAccepted ? "bottom-6 right-6 w-48 h-32 hover:scale-105 z-20" : "inset-0 w-full h-full z-0 opacity-50 blur-sm"
                        )}>
                            <video
                                playsInline
                                muted
                                ref={myVideo}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                            {!callAccepted && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-neon-blue/20 animate-pulse flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-neon-blue/40 flex items-center justify-center">
                                            <img src="/logo.png" className="w-10 h-10 opacity-50" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-end gap-6 bg-gradient-to-t from-black/90 to-transparent z-30">
                    {/* Incoming Call Actions */}
                    {call?.isReceivingCall && !callAccepted && (
                        <div className="flex gap-8 mb-4">
                            <Button
                                onClick={answerCall}
                                size="lg"
                                className="rounded-full bg-green-500 hover:bg-green-400 h-16 w-16 shadow-[0_0_20px_#22c55e]"
                            >
                                <Phone className="w-8 h-8 text-white animate-bounce" />
                            </Button>
                            <Button
                                onClick={leaveCall}
                                size="lg"
                                className="rounded-full bg-red-500 hover:bg-red-400 h-16 w-16"
                            >
                                <PhoneOff className="w-8 h-8 text-white" />
                            </Button>
                        </div>
                    )}

                    {/* Active Call Controls */}
                    {(callAccepted || isCalling) && (
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-full border border-white/10">
                            <Button
                                onClick={toggleMic}
                                size="icon"
                                variant={micOn ? "ghost" : "destructive"}
                                className="rounded-full h-12 w-12 hover:bg-white/20"
                            >
                                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </Button>

                            <Button
                                onClick={toggleCam}
                                size="icon"
                                variant={camOn ? "ghost" : "destructive"}
                                className="rounded-full h-12 w-12 hover:bg-white/20"
                            >
                                {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                            </Button>

                            <Button
                                onClick={leaveCall}
                                size="icon"
                                className="rounded-full bg-red-600 hover:bg-red-500 h-14 w-14 shadow-lg ml-4"
                            >
                                <PhoneOff className="w-6 h-6" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
