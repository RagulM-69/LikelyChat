"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Hash, Search, Bell, UserPlus, Check, X, Users, Plus } from "lucide-react";
import { ShoshinshaMark } from "@/components/ui/logo";
import { ProfileModal } from "../profile/profile-modal";
import { Settings, LogOut } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useConversation } from "@/components/providers/conversation-provider";
import axios from "axios";
import { cn } from "@/lib/utils";
import { CreateGroupModal } from "./create-group-modal";
import { AddFriendModal } from "./add-friend-modal";
import { useSocket } from "@/components/providers/socket-provider";

import { Trash2, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function FriendOptions({ friend, onUnfriend }: { friend: any; onUnfriend: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="h-8 w-8 text-gray-400 hover:text-white bg-transparent hover:bg-white/10 p-0 flex items-center justify-center">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                <DropdownMenuItem onClick={(e: any) => { e.stopPropagation(); onUnfriend(); }} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                    <Trash2 className="w-4 h-4 mr-2" /> Unfriend
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function ChatSidebar({ onSelect }: { onSelect?: () => void }) {
    const { user } = useUser();
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { onlineUsers } = useSocket(); // Use onlineUsers from socket
    const [friends, setFriends] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'groups'>('friends');

    // ... useEffect ...

    const handleUnfriend = async (friendId: string) => {
        if (!confirm("Are you sure you want to remove this friend?")) return;
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${friendId}/unfriend`, {
                userId: user._id
            });
            fetchFriends(); // Refresh
            // If we were chatting with them, deselect?
            if (selectedConversation?.members.includes(friendId) && !selectedConversation.isGroup) {
                setSelectedConversation(null);
            }
        } catch (err) {
            console.error("Failed to unfriend", err);
        }
    }

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = () => {
        fetchFriends();
        fetchRequests();
        fetchGroups();
    };

    const fetchFriends = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/friends/${user._id}`);
            setFriends(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/friend-requests/${user._id}`);
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/${user._id}`);
            // Filter only groups
            const userGroups = res.data.filter((c: any) => c.isGroup);
            setGroups(userGroups);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAccept = async (requestId: string) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${requestId}/accept-friend`, {
                userId: user._id
            });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const startConversation = async (friendId: string) => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
                senderId: user._id,
                receiverId: friendId
            });
            setSelectedConversation(res.data);
            onSelect?.();
        } catch (err) {
            console.error("Failed to start conversation", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border-r border-white/10 w-80">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex flex-col gap-3">
                <Button className="w-full justify-start gap-2 text-md font-bold truncate bg-black border border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.5)] hover:shadow-[0_0_20px_rgba(0,255,255,0.7)] hover:bg-cyan-950 transition-all duration-300">
                    <ShoshinshaMark className="w-6 h-6 flex-shrink-0" />
                    <span className="truncate">ENDHA AALUNGA NEENGA?</span>
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('friends')}
                    className={cn(
                        "flex-1 py-3 text-xs font-medium transition-colors relative",
                        activeTab === 'friends' ? "text-neon-blue" : "text-gray-400 hover:text-white"
                    )}
                >
                    FRIENDS
                    {activeTab === 'friends' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue shadow-[0_0_10px_#00f0ff]" />}
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    className={cn(
                        "flex-1 py-3 text-xs font-medium transition-colors relative",
                        activeTab === 'groups' ? "text-green-400" : "text-gray-400 hover:text-white"
                    )}
                >
                    GROUPS
                    {activeTab === 'groups' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_10px_#4ade80]" />}
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={cn(
                        "flex-1 py-3 text-xs font-medium transition-colors relative flex items-center justify-center gap-1",
                        activeTab === 'requests' ? "text-neon-purple" : "text-gray-400 hover:text-white"
                    )}
                >
                    REQUESTS
                    {requests.length > 0 && <span className="bg-neon-purple text-white text-[9px] px-1.5 rounded-full">{requests.length}</span>}
                    {activeTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple shadow-[0_0_10px_#bf00ff]" />}
                </button>
            </div>

            {/* Actions Bar */}
            <div className="p-3 border-b border-white/5 flex gap-2">
                {activeTab === 'friends' && (
                    <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 h-9 px-3 rounded-md flex items-center justify-center" onClick={() => setShowAddFriend(true)}>
                        <UserPlus className="w-4 h-4 mr-2 text-neon-blue" /> Add Friend
                    </Button>
                )}
                {activeTab === 'groups' && (
                    <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 h-9 px-3 rounded-md flex items-center justify-center" onClick={() => setShowCreateGroup(true)}>
                        <Plus className="w-4 h-4 mr-2 text-green-400" /> Create Group
                    </Button>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">

                {activeTab === 'friends' && (
                    <>
                        {friends.length === 0 && <div className="text-center text-gray-500 mt-10 text-xs">No friends found.</div>}

                        {/* Online Friends */}
                        {(() => {
                            const onlineCount = friends.filter(f => onlineUsers.some(u => u.userId === f._id)).length;
                            console.log("Sidebar: Friends:", friends.map(f => f._id), "OnlineUsers:", onlineUsers);
                            return onlineCount > 0 && (
                                <div className="text-[10px] font-bold text-gray-400 px-3 py-2 uppercase tracking-wider">Online — {onlineCount}</div>
                            );
                        })()}
                        {friends.filter(f => onlineUsers.some(u => u.userId === f._id)).map((friend) => (
                            <div key={friend._id} className="group relative w-full">
                                <button
                                    onClick={() => startConversation(friend._id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors",
                                        selectedConversation?.members.includes(friend._id) && !selectedConversation.isGroup && "bg-white/10 border border-white/10"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-500 to-neon-blue relative overflow-hidden">
                                        {friend.avatar ? (
                                            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-white">{friend.username[0].toUpperCase()}</div>
                                        )}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <div className="font-medium text-white group-hover:text-neon-blue transition-colors truncate">{friend.nickname || friend.username}</div>
                                        <div className="text-xs text-gray-500">{friend.about || "Online"}</div>
                                    </div>
                                </button>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FriendOptions friend={friend} onUnfriend={() => handleUnfriend(friend._id)} />
                                </div>
                            </div>
                        ))}

                        {/* Offline Friends */}
                        {friends.filter(f => !onlineUsers.some(u => u.userId === f._id)).length > 0 && (
                            <div className="text-[10px] font-bold text-gray-400 px-3 py-2 mt-4 uppercase tracking-wider">Offline — {friends.filter(f => !onlineUsers.some(u => u.userId === f._id)).length}</div>
                        )}
                        {friends.filter(f => !onlineUsers.some(u => u.userId === f._id)).map((friend) => (
                            <div key={friend._id} className="group relative w-full">
                                <button
                                    onClick={() => startConversation(friend._id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors opacity-70",
                                        selectedConversation?.members.includes(friend._id) && !selectedConversation.isGroup && "bg-white/10 border border-white/10 opacity-100"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-700 relative overflow-hidden grayscale">
                                        {friend.avatar ? (
                                            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-white">{friend.username[0].toUpperCase()}</div>
                                        )}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-black" />
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <div className="font-medium text-gray-300 truncate">{friend.nickname || friend.username}</div>
                                        <div className="text-xs text-gray-500">Offline</div>
                                    </div>
                                </button>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FriendOptions friend={friend} onUnfriend={() => handleUnfriend(friend._id)} />
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {activeTab === 'groups' && (
                    <>
                        {groups.length === 0 && <div className="text-center text-gray-500 mt-10 text-xs">No groups yet.</div>}
                        {groups.map((group) => (
                            <button
                                key={group._id}
                                onClick={() => {
                                    setSelectedConversation(group);
                                    onSelect?.();
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group",
                                    selectedConversation?._id === group._id && "bg-white/10 border border-white/10"
                                )}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm">
                                    {group.name ? group.name.substring(0, 2).toUpperCase() : "GR"}
                                </div>
                                <div className="text-left overflow-hidden">
                                    <div className="font-medium text-white group-hover:text-green-400 transition-colors truncate">{group.name}</div>
                                    <div className="text-xs text-gray-500">{group.members.length} members</div>
                                </div>
                            </button>
                        ))}
                    </>
                )}

                {activeTab === 'requests' && (
                    <>
                        {requests.length === 0 && <div className="text-center text-gray-500 mt-10 text-xs">No pending requests.</div>}
                        {requests.map((req) => (
                            <div key={req._id} className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center overflow-hidden">
                                        {req.avatar ? <img src={req.avatar} className="w-full h-full object-cover" /> : req.username[0]}
                                    </div>
                                    <div className="font-medium text-white text-sm">{req.username}</div>
                                </div>
                                <div className="flex gap-1">
                                    <Button className="h-7 w-7 bg-green-500/20 text-green-400 hover:bg-green-500/40 p-0 flex items-center justify-center rounded-md" onClick={() => handleAccept(req._id)}><Check className="w-3 h-3" /></Button>
                                    <Button className="h-7 w-7 text-red-400 hover:bg-red-500/20 bg-transparent p-0 flex items-center justify-center rounded-md"><X className="w-3 h-3" /></Button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* User Footer */}
            {user && (
                <div className="p-3 bg-black/60 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cosmic-500 overflow-hidden border border-white/10">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-neon-purple to-neon-blue">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-bold text-white text-sm truncate max-w-[120px]">
                                {user.nickname || user.username}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-[120px]">
                                {user.about || "Online"}
                            </div>
                        </div>
                    </div>
                    <Button
                        className="hover:bg-white/10 text-gray-400 hover:text-white h-10 w-10 p-0 flex items-center justify-center rounded-md bg-transparent"
                        onClick={() => setShowProfile(true)}
                    >
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            )}

            <AddFriendModal isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} />
            <CreateGroupModal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} onGroupCreated={fetchGroups} />
            <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
        </div>
    );
}
