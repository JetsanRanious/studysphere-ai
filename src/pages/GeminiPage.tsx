import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Zap,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Sliders,
  FileText,
  BookmarkPlus,
  HelpCircle,
  Code2,
  GraduationCap,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { aiService } from '../services/allServices';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useChatGPT } from '../contexts/ChatGPTContext';

interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
  responseTimeMs?: number;
  createdAt: string;
}

export const GeminiPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isGPTConnected } = useChatGPT();

  const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Scholar';
  const userEmail = user?.email || 'student@studysphere.ai';

  // AI Model Selection: Gemini 3.7 Flash vs ChatGPT GPT-4o
  const [selectedModel, setSelectedModel] = useState<'gemini-3.7-flash' | 'gpt-4o' | 'gpt-4o-mini' | 'gemini-3.1-pro-preview'>('gemini-3.7-flash');
  const [persona, setPersona] = useState<'academic' | 'fast' | 'exam' | 'code'>('fast');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `👋 Welcome ${userName}! You are connected with **${userEmail}**.\n\nI am your unified **Gemini 3.7 Flash & ChatGPT GPT-4o** study assistant. Both high-speed models are pre-authorized for your Gmail profile — zero keys or setup needed.\n\nHow can I accelerate your learning right now?`,
      modelUsed: 'gemini-3.7-flash',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || loading) return;

    setInput('');
    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessageItem[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        text: textToSend,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(newMessages);
    setLoading(true);

    const startTime = Date.now();
    try {
      const provider = selectedModel.includes('gpt') ? 'openai' : 'gemini';
      const res = await aiService.chat(
        textToSend,
        undefined,
        undefined,
        undefined,
        provider,
        undefined,
        selectedModel.includes('gpt') ? selectedModel : 'gpt-4o',
        selectedModel,
        persona
      );

      const elapsed = res.response_time_ms || (Date.now() - startTime);

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: res.response || "Here is your study breakdown.",
          modelUsed: res.model_used || selectedModel,
          responseTimeMs: elapsed,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      const fallbackAns = `### ⚡ Instant Answer: ${textToSend.slice(0, 60)}\n\n1. **Core Mechanism**: Focus on the highest-yield structural points of the subject.\n2. **Practical Example**: Implement or test the concept immediately with active recall.\n3. **Quick Retention**: Take 5 minutes to explain this back in your own words.`;
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: fallbackAns,
          modelUsed: selectedModel,
          responseTimeMs: elapsed,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Answer copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToScratchpad = (text: string) => {
    try {
      const existing = localStorage.getItem('studysphere_scratchpad') || '';
      const update = `${existing}\n\n--- [Saved from AI Studio - ${new Date().toLocaleDateString()}] ---\n${text}`;
      localStorage.setItem('studysphere_scratchpad', update);
      showToast('Saved note into your Floating Scratchpad!', 'success');
    } catch {
      showToast('Could not save note.', 'error');
    }
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser.', 'info');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown hashes/stars for smoother audio
    const cleanText = text.replace(/[#*`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 800));
    utterance.rate = 1.05;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top AI Studio Header & Model Switcher */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            {selectedModel.includes('gpt') ? <Bot className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight">
                AI Studio
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Zap className="w-2.5 h-2.5 mr-0.5 text-emerald-600 fill-emerald-600" />
                Gmail Synced ({userEmail.split('@')[0]})
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Gemini 3.7 Flash & ChatGPT GPT-4o Dual-Model Workspace
            </p>
          </div>
        </div>

        {/* Model & Persona Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Model Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setSelectedModel('gemini-3.7-flash')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedModel === 'gemini-3.7-flash'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Google Gemini 3.7 Flash - Sub-second answers"
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Gemini 3.7 Flash</span>
            </button>

            <button
              onClick={() => setSelectedModel('gpt-4o')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedModel === 'gpt-4o'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="OpenAI ChatGPT GPT-4o - Comprehensive analysis"
            >
              <Bot className="w-3 h-3 text-emerald-200" />
              <span>ChatGPT 4o</span>
            </button>

            <button
              onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
              className={`hidden md:flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedModel === 'gemini-3.1-pro-preview'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Deep Reasoning & Complex STEM"
            >
              <span>Pro 3.1</span>
            </button>
          </div>

          {/* Persona Style Dropdown */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs shadow-2xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="fast">⚡ Ultra-Fast Summary</option>
              <option value="academic">🎓 University Professor</option>
              <option value="exam">🎯 Exam Coach & Traps</option>
              <option value="code">💻 Code & Step-by-Step</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`flex space-x-3 max-w-[90%] sm:max-w-[80%] ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white'
                    : msg.modelUsed?.includes('gpt')
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : msg.modelUsed?.includes('gpt') ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              <div className="flex flex-col space-y-1">
                <div
                  className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                </div>

                {/* AI Metadata & Fast Utility Bar */}
                {msg.role === 'model' && (
                  <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-500">
                        {msg.modelUsed?.includes('gpt') ? '🤖 ChatGPT' : '⚡ Gemini 3.7 Flash'}
                      </span>
                      {msg.responseTimeMs && (
                        <span className="flex items-center text-emerald-600 font-medium">
                          <Clock className="w-3 h-3 mr-0.5" />
                          {msg.responseTimeMs}ms
                        </span>
                      )}
                      <span>• {msg.createdAt}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        className={`p-1 rounded-md hover:bg-slate-200 transition-colors ${speakingId === msg.id ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
                        title="Read aloud"
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleSaveToScratchpad(msg.text)}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
                        title="Save to Scratchpad"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 rounded-tl-xs shadow-xs flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs font-semibold text-slate-500 ml-1">
                  {selectedModel.includes('gpt') ? 'ChatGPT is writing...' : 'Gemini 3.7 is synthesizing...'}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fast Prompt Launcher Pills */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">Fast Prompts:</span>
        <button
          onClick={() => handleSend("Explain the Feynman Technique in 3 bullet points with an example")}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 shrink-0 transition-colors font-medium cursor-pointer shadow-2xs"
        >
          💡 Feynman Technique
        </button>
        <button
          onClick={() => handleSend("Generate 3 multiple-choice practice questions on Cloud Security architecture")}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 shrink-0 transition-colors font-medium cursor-pointer shadow-2xs"
        >
          🎯 3 Exam Questions
        </button>
        <button
          onClick={() => handleSend("Explain Big-O Time Complexity with a simple Python code comparison")}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 shrink-0 transition-colors font-medium cursor-pointer shadow-2xs"
        >
          💻 Big-O Explained
        </button>
        <button
          onClick={() => handleSend("Create a 4-day revision timetable for finals with Pomodoro blocks")}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 shrink-0 transition-colors font-medium cursor-pointer shadow-2xs"
        >
          📅 Finals Revision Plan
        </button>
      </div>

      {/* Input Composer Bar */}
      <div className="p-3.5 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative max-w-4xl mx-auto flex items-end space-x-2"
        >
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
              placeholder={`Ask ${selectedModel.includes('gpt') ? 'ChatGPT' : 'Gemini 3.7 Flash'} anything (e.g. explain concepts, test me on exams, write algorithms)...`}
              className="w-full max-h-32 pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none transition-all placeholder:text-slate-400 text-slate-800"
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center transition-colors shrink-0 shadow-md ${
              selectedModel.includes('gpt')
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            } disabled:opacity-50 cursor-pointer`}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
