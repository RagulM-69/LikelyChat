"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function MobileToggle() {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-gray-400">
                <Menu className="w-5 h-5" />
            </Button>

            {/* Simple Overlay for Mobile Sidebar */}
            {open && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
                    <div className="absolute left-0 top-0 h-full w-80 bg-black border-r border-white/10" onClick={(e) => e.stopPropagation()}>
                        <ChatSidebar onSelect={() => setOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
