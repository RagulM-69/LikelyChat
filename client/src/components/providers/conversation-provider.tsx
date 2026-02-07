"use client";

import React, { createContext, useContext, useState } from "react";

type Conversation = {
    _id: string;
    isGroup: boolean;
    name?: string;
    members: string[]; // User IDs
    // Add other fields as needed
};

type ConversationContextType = {
    selectedConversation: Conversation | null;
    setSelectedConversation: (conversation: Conversation | null) => void;
};

const ConversationContext = createContext<ConversationContextType>({
    selectedConversation: null,
    setSelectedConversation: () => { },
});

export const useConversation = () => useContext(ConversationContext);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    return (
        <ConversationContext.Provider value={{ selectedConversation, setSelectedConversation }}>
            {children}
        </ConversationContext.Provider>
    );
}
