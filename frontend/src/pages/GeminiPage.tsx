import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, User, AlertCircle, Key, Trash2 } from 'lucide-react';
import { Button } from '../components/common/Button';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const GeminiPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', parts: [{ text: "Hi there! I'm Gemini, Google's AI model. I'm connected directly to your browser. What would you like to explore today?" }] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [geminiKey, setGeminiKey] = useState<string>(localStorage.getItem('studysphere_gemini_key') || '');
  const [isConfiguring, setIsConfiguring] = useState(!localStorage.getItem('studysphere_gemini_key'));
  const [tempKey, setTempKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const saveKey = () => {
    if (!tempKey.trim()) return;
    localStorage.setItem('studysphere_gemini_key', tempKey.trim());
    setGeminiKey(tempKey.trim());
    setIsConfiguring(false);
    setTempKey('');
  };

  const clearKey = () => {
    localStorage.removeItem('studysphere_gemini_key');
    setGeminiKey('');
    setIsConfiguring(true);
    setMessages([
      { role: 'model', parts: [{ text: "Hi there! I'm Gemini, Google's AI model. I'm connected directly to your browser. What would you like to explore today?" }] }
    ]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !geminiKey) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: newMessages.map(m => ({
            role: m.role,
            parts: m.parts
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiText }] }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Error connecting to Gemini: ${err.message}. Please check your API key.` }] }]);
    } finally {
      setLoading(false);
    }
  };

  if (isConfiguring) {
    return (
      <div className="flex-1 h-[calc(100vh-6rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Connect Google Gemini</h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Connect directly to Google's Gemini API for lightning-fast, uncensored study assistance bypassing the backend.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gemini API Key</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Get a free API key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>.
              </p>
            </div>
            <Button onClick={saveKey} className="w-full" size="lg" disabled={!tempKey.trim()}>
              Connect Gemini
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Gemini 1.5 Flash</h2>
            <p className="text-xs text-slate-500 font-medium">Direct Browser Connection</p>
          </div>
        </div>
        <button 
          onClick={clearKey}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-xs font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Disconnect</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex space-x-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.parts[0].text}</p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-tl-sm shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-end space-x-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Gemini..."
              className="w-full max-h-32 pl-4 pr-12 py-3.5 bg-slate-100 border-transparent rounded-2xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none transition-all"
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shrink-0 shadow-md shadow-blue-500/20"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
          Gemini can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
};
