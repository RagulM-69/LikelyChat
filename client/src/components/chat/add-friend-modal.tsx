"use client";

import { useState } from "react";
import { X, Search, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useUser } from "@/hooks/use-user";

export function AddFriendModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user } = useUser();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [requestSent, setRequestSent] = useState<string[]>([]);

    if (!isOpen) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setSearching(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/search?q=${query}`);
            // Filter out self
            setResults(res.data.filter((u: any) => u._id !== user._id));
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const sendRequest = async (targetId: string) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${targetId}/friend-request`, {
                userId: user._id
            });
            setRequestSent((prev) => [...prev, targetId]);
        } catch (err) {
            console.error(err);
            alert("Failed to send request or already sent.");
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

                <h2 className="text-xl font-bold text-white mb-4">Add Friend</h2>

                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by username..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue"
                    />
                    <Button type="submit" variant="secondary" disabled={searching}>
                        <Search className="w-4 h-4" />
                    </Button>
                </form>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {results.length === 0 && !searching && query && (
                        <p className="text-center text-gray-500 py-4">No users found.</p>
                    )}

                    {results.map((u) => (
                        <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue" />
                                <span className="text-white font-medium">{u.username}</span>
                            </div>
                            {requestSent.includes(u._id) ? (
                                <span className="text-green-400 flex items-center gap-1 text-sm"><Check className="w-3 h-3" /> Sent</span>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-neon-blue hover:text-white hover:bg-neon-blue/20"
                                    onClick={() => sendRequest(u._id)}
                                >
                                    <UserPlus className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
