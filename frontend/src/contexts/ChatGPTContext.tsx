import React, { createContext, useContext, useState } from 'react';

interface ChatGPTContextType {
  isGPTConnected: boolean;
  gptKey: string;
  gptModel: string;
  connectGPT: (key: string, model?: string) => void;
  disconnectGPT: () => void;
}

const ChatGPTContext = createContext<ChatGPTContextType | undefined>(undefined);

export const ChatGPTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gptKey, setGptKey] = useState(() => localStorage.getItem('studysphere_openai_key') || '');
  const [gptModel, setGptModel] = useState(() => localStorage.getItem('studysphere_openai_model') || 'gpt-4o');

  const isGPTConnected = gptKey.trim().startsWith('sk-');

  const connectGPT = (key: string, model: string = 'gpt-4o') => {
    localStorage.setItem('studysphere_openai_key', key.trim());
    localStorage.setItem('studysphere_openai_model', model);
    setGptKey(key.trim());
    setGptModel(model);
  };

  const disconnectGPT = () => {
    localStorage.removeItem('studysphere_openai_key');
    setGptKey('');
  };

  return (
    <ChatGPTContext.Provider value={{ isGPTConnected, gptKey, gptModel, connectGPT, disconnectGPT }}>
      {children}
    </ChatGPTContext.Provider>
  );
};

export const useChatGPT = () => {
  const context = useContext(ChatGPTContext);
  if (context === undefined) {
    throw new Error('useChatGPT must be used within a ChatGPTProvider');
  }
  return context;
};
