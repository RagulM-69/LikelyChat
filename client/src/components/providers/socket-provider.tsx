"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";
import { useUser } from "@/hooks/use-user";

type SocketContextType = {
    socket: any | null;
    isConnected: boolean;
    onlineUsers: any[];
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: [],
});

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<any | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

    const { user } = useUser(); // Need to import this

    useEffect(() => {
        const socketInstance = new (ClientIO as any)(process.env.NEXT_PUBLIC_API_URL!, {
            path: "/socket.io",
            addTrailingSlash: false,
        });

        socketInstance.on("connect", () => {
            setIsConnected(true);
            console.log("Socket Connected:", socketInstance.id);
        });

        // Separate effect will handle addUser to avoid race conditions


        socketInstance.on("disconnect", () => {
            setIsConnected(false);
        });

        socketInstance.on("getUsers", (users: any[]) => {
            console.log("Socket: Received onlineUsers:", users);
            setOnlineUsers(users);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user]); // Re-run if user changes

    useEffect(() => {
        if (socket && isConnected && user) {
            console.log("Emitting addUser for:", user._id);
            socket.emit("addUser", user._id);
            socket.emit("joinRoom", user._id);
        }
    }, [socket, isConnected, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
