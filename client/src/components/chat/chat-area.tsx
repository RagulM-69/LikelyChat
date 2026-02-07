"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Users } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";
import { useUser } from "@/hooks/use-user";
import { useConversation } from "@/components/providers/conversation-provider";
import axios from "axios";
import { toast } from "sonner";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useCall } from "@/components/providers/call-provider";
import { MobileToggle } from "@/components/navigation/mobile-toggle";
import { GroupDetailsModal } from "./group-details-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export function ChatArea() {
    const { socket } = useSocket();
    const { user } = useUser();
    const { selectedConversation } = useConversation();
    const { callUser } = useCall()!;
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [showGroupDetails, setShowGroupDetails] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages();
            if (socket) {
                socket.emit("joinConversation", selectedConversation._id);
            }
        }
    }, [selectedConversation, socket]);

    useEffect(() => {
        if (!socket) return;

        socket.on("message", (msg: any) => {
            if (selectedConversation && msg.conversationId === selectedConversation._id) {
                setMessages((prev) => {
                    // Prevent duplicates (check by ID)
                    if (prev.some(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
                scrollToBottom();
            }
        });

        return () => {
            socket.off("message");
        };
    }, [socket, selectedConversation]);

    const fetchMessages = async () => {
        if (!selectedConversation) return;
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/message/${selectedConversation._id}`);
            setMessages(res.data);
            scrollToBottom();
        } catch (err) {
            console.error(err);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const onEmojiClick = (emojiObject: any) => {
        setInput((prev) => prev + emojiObject.emoji);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !selectedConversation) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const imageUrl = uploadRes.data;
            await sendMessage(null, imageUrl);
        } catch (err) {
            console.error("Upload failed", err);
            toast.error("Failed to upload image");
        }
    };

    const sendMessage = async (e: React.FormEvent | null, imageUrl?: string) => {
        if (e) e.preventDefault();

        const content = imageUrl ? "" : input;
        if ((!content.trim() && !imageUrl) || !socket || !selectedConversation || !user) return;

        // Optimistic UI Update
        const tempId = Date.now().toString();
        const optimisticMsg = {
            _id: tempId,
            conversationId: selectedConversation._id,
            sender: user._id,
            senderName: user.username,
            text: content,
            imageUrl: imageUrl,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setInput("");
        setShowEmoji(false);
        scrollToBottom();

        try {
            // Save to DB
            const dbMsg = {
                conversationId: selectedConversation._id,
                sender: user._id,
                text: content,
                imageUrl: imageUrl
            };
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/message`, dbMsg);

            // Replace optimistic message with real one (or just let socket update it)
            // Ideally, we'd update the ID, but the socket event usually handles the "real" message coming back.
            // To avoid duplicates if socket is fast, we might want to filter out the optimistic one when real one comes.
            // For now, let's keep it simple: The socket event will arrive. 
            // We can match by a temporary ID if we want perfection, but standard "append" might duplicate if we don't be careful.

            socket.emit("sendMessage", { ...res.data, senderName: user.username });

            // Remove optimistic one and replace with real one to confirm sent status (red tick vs gray tick)
            setMessages((prev) => prev.map(m => m._id === tempId ? { ...res.data, senderName: user.username } : m));

        } catch (err) {
            console.error(err);
            toast.error("Failed to send message");
            // Remove optimistic message on failure
            setMessages((prev) => prev.filter(m => m._id !== tempId));
        }
    };

    const handleCall = () => {
        if (!selectedConversation) return;
        if (selectedConversation.isGroup) {
            toast.error("Video/Voice calls are not available for groups yet.");
            return;
        }
        const otherMember = selectedConversation.members.find((m: any) => m !== user._id);
        if (otherMember) {
            callUser(otherMember);
        }
    };

    if (!selectedConversation) {
        return (
            <div className="flex flex-col h-full items-center justify-center bg-neutral-900/50 backdrop-blur-sm text-gray-500">
                <p>Select a friend or group to start chatting.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-neutral-900/50 backdrop-blur-sm relative">
            {/* Chat Header */}
            <div className="h-16 border-b border-white/10 flex items-center px-6 justify-between bg-black/40">
                <div className="flex items-center gap-3">
                    <MobileToggle />
                    <button onClick={() => selectedConversation.isGroup && setShowGroupDetails(true)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className={selectedConversation.isGroup ? "w-10 h-10 rounded-full bg-green-600 flex items-center justify-center" : "w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-500 to-neon-blue"}>
                            {selectedConversation.isGroup ? <Users className="w-5 h-5 text-white" /> : null}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-wide">
                                {selectedConversation.isGroup ? selectedConversation.name : "Chat"}
                            </h2>
                            {selectedConversation.isGroup && <span className="text-xs text-gray-400">{selectedConversation.members.length} members</span>}
                        </div>
                    </button>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <Button size="icon" variant="ghost" className="hover:text-green-400" onClick={handleCall}><Phone className="w-5 h-5" /></Button>
                    <Button size="icon" variant="ghost" className="hover:text-neon-blue" onClick={handleCall}><Video className="w-5 h-5" /></Button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost"><MoreVertical className="w-5 h-5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                            {selectedConversation.isGroup && (
                                <>
                                    <DropdownMenuItem onClick={() => setShowGroupDetails(true)} className="cursor-pointer">
                                        Edit Group Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer">
                                        Mute Notifications
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer">
                                        Change Group Icon
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                </>
                            )}
                            <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                                {selectedConversation.isGroup ? "Leave Group" : "Block User"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <GroupDetailsModal isOpen={showGroupDetails} onClose={() => setShowGroupDetails(false)} conversation={selectedConversation} onUpdate={() => window.location.reload()} />


            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10" onClick={() => setShowEmoji(false)}>
                {messages.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
                    const isMe = senderId === user?._id;
                    const senderName = msg.senderName || (typeof msg.sender === 'object' ? msg.sender.username : "User");

                    return (
                        <div key={i} className={`flex gap-4 w-full ${isMe ? "justify-end" : "justify-start"}`}>
                            {!isMe && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-500 flex-shrink-0 border border-white/10" />}
                            <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {!isMe && <span className="text-xs font-bold text-gray-400">{senderName}</span>}
                                    <span className="text-[10px] text-gray-600">{new Date(msg.createdAt || msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={msg.imageUrl ? "" : `p-3 rounded-2xl ${isMe ? "bg-cosmic-600 text-white" : "bg-white/10 text-gray-200"} shadow-lg backdrop-blur-md`}>
                                    {msg.imageUrl ? (
                                        <img src={msg.imageUrl} alt="Identified Attachment" className="max-w-xs rounded-xl border border-white/20 shadow-lg" />
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/60 border-t border-white/10 relative z-20">
                {showEmoji && (
                    <div className="absolute bottom-20 right-10 z-50 shadow-2xl rounded-xl overflow-hidden border border-white/10">
                        <EmojiPicker theme={Theme.DARK} onEmojiClick={onEmojiClick} />
                    </div>
                )}

                <form onSubmit={sendMessage} className="relative flex items-center gap-2 max-w-5xl mx-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*"
                    />
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-gray-400 hover:text-cyan-400 hover:bg-white/5 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message ${selectedConversation.isGroup ? selectedConversation.name : "..."}`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all placeholder:text-gray-600"
                    />

                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className={`absolute right-14 text-gray-400 hover:text-yellow-400 hover:bg-transparent ${showEmoji ? "text-yellow-400" : ""}`}
                        onClick={() => setShowEmoji(!showEmoji)}
                    >
                        <Smile className="w-5 h-5" />
                    </Button>

                    <Button type="submit" size="icon" variant="neon" className="rounded-full w-10 h-10 flex items-center justify-center p-0" disabled={!input.trim()}>
                        <Send className="w-4 h-4 ml-0.5" />
                    </Button>
                </form>
            </div>
        </div >
    );
}
