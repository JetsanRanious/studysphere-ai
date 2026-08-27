import React, { createContext, useContext } from 'react';

interface ChatGPTContextType {
  isGPTConnected: boolean;
  model: string;
}

const ChatGPTContext = createContext<ChatGPTContextType>({
  isGPTConnected: true,
  model: 'gpt-4o-mini'
});

export const ChatGPTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ChatGPTContext.Provider value={{ isGPTConnected: true, model: 'gpt-4o-mini' }}>
      {children}
    </ChatGPTContext.Provider>
  );
};

export const useChatGPT = () => {
  const context = useContext(ChatGPTContext);
  if (!context) throw new Error('useChatGPT must be used within ChatGPTProvider');
  return context;
};
