import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Settings } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useChatGPT } from '../contexts/ChatGPTContext';
import { useToast } from '../contexts/ToastContext';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const ChatGPTPage: React.FC = () => {
  const { isGPTConnected, gptKey, gptModel } = useChatGPT();
  const { showToast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am ChatGPT. How can I help you with your studies today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!isGPTConnected) {
      showToast('Please connect ChatGPT in the top navigation bar first.', 'error');
      return;
    }

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${gptKey}`
        },
        body: JSON.stringify({
          model: gptModel || 'gpt-4o',
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('API Error: ' + response.statusText);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      showToast('Failed to get response from ChatGPT. Check your API key.', 'error');
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I encountered an error connecting to OpenAI. Please verify your API key in the connection settings.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGPTConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Connect to ChatGPT</h2>
        <p className="text-sm text-slate-500 mb-6">
          To chat directly with ChatGPT, please connect your OpenAI account using the button in the top right navigation bar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">ChatGPT Assistant</h2>
            <p className="text-[10px] font-medium text-emerald-600 flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              Connected to {gptModel}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-emerald-600" />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-2.5 text-sm flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>ChatGPT is thinking...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message ChatGPT..."
            className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            rows={1}
          />
          <Button 
            type="submit" 
            variant="primary" 
            className="h-[44px] px-4 rounded-xl flex-shrink-0"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          ChatGPT can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
};
