"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserMinus, UserPlus, LogOut } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

interface GroupDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversation: any;
    onUpdate: () => void; // Refresh conversation data
}

export function GroupDetailsModal({ isOpen, onClose, conversation, onUpdate }: GroupDetailsModalProps) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [newMemberId, setNewMemberId] = useState("");

    if (!conversation || !conversation.isGroup) return null;

    const handleLeaveGroup = async () => {
        try {
            setLoading(true);
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/groupremove`, {
                conversationId: conversation._id,
                userId: user._id
            });
            toast.success("Left group successfully");
            onUpdate(); // Should likely clear selectedConversation or refresh list
            onClose();
            window.location.reload(); // Simple reload to refresh state for now
        } catch (err) {
            console.error(err);
            toast.error("Failed to leave group");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-black/90 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                        {conversation.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="text-sm font-medium text-gray-400">Members ({conversation.members.length})</div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {conversation.members.map((member: any) => (
                            // Depending on if member is populated or just ID
                            <div key={member._id || member} className="flex items-center justify-between p-2 rounded bg-white/5">
                                <span className="text-sm">{member.username || "Member"}</span>
                                {member._id === conversation.groupAdmin && <span className="text-xs text-yellow-500">Admin</span>}
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <Button
                            className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white"
                            onClick={handleLeaveGroup}
                            disabled={loading}
                        >
                            <LogOut className="w-4 h-4" /> Leave Group
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
