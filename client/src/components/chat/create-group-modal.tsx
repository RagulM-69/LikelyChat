"use client";

import { useState, useEffect } from "react";
import { X, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useUser } from "@/hooks/use-user";

export function CreateGroupModal({ isOpen, onClose, onGroupCreated }: { isOpen: boolean; onClose: () => void, onGroupCreated: () => void }) {
    const { user } = useUser();
    const [groupName, setGroupName] = useState("");
    const [friends, setFriends] = useState<any[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            fetchFriends();
        }
    }, [user, isOpen]);

    const fetchFriends = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/friends/${user._id}`);
            setFriends(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleFriend = (id: string) => {
        setSelectedFriends(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName || selectedFriends.length === 0) return;
        setLoading(true);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/group`, {
                members: [...selectedFriends, user._id],
                name: groupName,
                adminId: user._id
            });
            onGroupCreated();
            onClose();
            setGroupName("");
            setSelectedFriends([]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-cosmic-900 border border-white/10 rounded-2xl shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-white mb-4">Create Group</h2>

                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Group Name</label>
                        <input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g. Gamers United"
                            className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Select Members</label>
                        <div className="mt-1 max-h-[200px] overflow-y-auto space-y-2 border border-white/5 rounded-lg p-2">
                            {friends.length === 0 && <p className="text-gray-500 text-sm text-center py-2">No friends found.</p>}

                            {friends.map(friend => (
                                <div
                                    key={friend._id}
                                    onClick={() => toggleFriend(friend._id)}
                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedFriends.includes(friend._id) ? "bg-neon-purple/20 border border-neon-purple/50" : "hover:bg-white/5 border border-transparent"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600" />
                                        <span className="text-white text-sm">{friend.username}</span>
                                    </div>
                                    {selectedFriends.includes(friend._id) && <Check className="w-4 h-4 text-neon-purple" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-neon-purple hover:bg-purple-600 text-white"
                        disabled={loading || selectedFriends.length === 0}
                    >
                        {loading ? "Creating..." : "Create Group"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
