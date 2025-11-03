/**
 * Chat Button Context
 * Contexte global pour partager la référence du bouton de chat
 * Permet aux composants de notifications de se positionner correctement
 */

import React, { createContext, useContext, useRef, ReactNode } from 'react';

interface ChatButtonContextValue {
  chatButtonRef: React.RefObject<HTMLButtonElement>;
}

const ChatButtonContext = createContext<ChatButtonContextValue | null>(null);

export const useChatButtonRef = () => {
  const context = useContext(ChatButtonContext);
  if (!context) {
    return { chatButtonRef: { current: null } as React.RefObject<HTMLButtonElement> };
  }
  return context;
};

interface ChatButtonProviderProps {
  children: ReactNode;
}

export const ChatButtonProvider: React.FC<ChatButtonProviderProps> = ({ children }) => {
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <ChatButtonContext.Provider value={{ chatButtonRef }}>
      {children}
    </ChatButtonContext.Provider>
  );
};
