"use client";

import { useState, useRef } from "react";
import { X, Camera, Save, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useUser } from "@/hooks/use-user";

export function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user, login } = useUser(); // login updates the user state
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState(user?.username || "");
    const [nickname, setNickname] = useState(user?.nickname || "");
    const [about, setAbout] = useState(user?.about || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user || !isOpen) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setAvatar(uploadRes.data);
        } catch (err) {
            console.error("Avatar upload failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}`, {
                userId: user._id,
                username,
                nickname,
                about,
                avatar
            });

            // Update local user state
            // We can reuse the login function to set the user object, or we need a specific 'updateUser' in the hook
            // For now, assuming login sets the local storage and state correctly.
            localStorage.setItem("user", JSON.stringify(res.data));
            // Force reload or better, update context. 
            // Ideally useUser should expose a method to update state. 
            // For this MVP, we will try to update via the hook if exposed, otherwise generic reload.
            window.location.reload();

            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-cosmic-900 border border-white/10 rounded-2xl shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-24 h-24 group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neon-blue bg-gray-800">
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cosmic-600 to-neon-purple text-white text-3xl font-bold">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                                accept="image/*"
                            />
                        </div>
                        <p className="text-xs text-gray-400">Click to change avatar</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Username</label>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Nickname</label>
                            <input
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="e.g. The Boss"
                                className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">About</label>
                            <textarea
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                rows={3}
                                placeholder="Tell us about yourself..."
                                className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue resize-none"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-neon-blue hover:bg-cyan-600 text-black font-bold"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>

                <div className="mt-4 pt-4 border-t border-white/10">
                    <Button
                        variant="ghost"
                        className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start"
                        onClick={() => {
                            localStorage.removeItem("user");
                            localStorage.removeItem("token");
                            window.location.href = "/login"; // Or get started page
                        }}
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Log Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
