"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ConversationProvider } from "@/components/providers/conversation-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { CallProvider } from "@/components/providers/call-provider";
import { VideoCallModal } from "@/components/chat/video-call-modal";
import { Toaster } from "sonner";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check auth
        const user = localStorage.getItem("user");
        if (!user) {
            router.push("/login");
        }
        setMounted(true);
    }, [router]);

    if (!mounted) return null;

    return (
        <SocketProvider>
            <ConversationProvider>
                <CallProvider>
                    <div className="flex h-screen w-full bg-black text-white overflow-hidden relative">
                        {/* Sidebar */}
                        <div className="w-80 hidden md:flex flex-col border-r border-white/10 glass z-20">
                            <ChatSidebar />
                        </div>

                        {/* Main Content */}
                        <main className="flex-1 h-full relative z-10 flex flex-col min-w-0 bg-neutral-950/50">
                            {children}
                            <VideoCallModal />
                        </main>

                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

                        <Toaster position="top-center" theme="dark" />
                    </div>
                </CallProvider>
            </ConversationProvider>
        </SocketProvider>
    );
}
