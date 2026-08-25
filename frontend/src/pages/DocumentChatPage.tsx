import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  BookOpen,
  HelpCircle,
  Layers,
  ChevronRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { QuizModal } from '../components/ai-chat/QuizModal';
import { SummaryModal } from '../components/ai-chat/SummaryModal';
import { FlashcardsModal } from '../components/ai-chat/FlashcardsModal';
import { aiService, documentService, roomService } from '../services/allServices';
import { StudyDocument, StudyRoom, ChatMessage, QuizQuestion, FlashcardItem } from '../types';
import { useToast } from '../contexts/ToastContext';

export const DocumentChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialDocId = searchParams.get('docId') ? parseInt(searchParams.get('docId')!, 10) : undefined;
  const initialRoomId = searchParams.get('roomId') ? parseInt(searchParams.get('roomId')!, 10) : undefined;

  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(initialDocId);
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(initialRoomId);
  const [aiProvider, setAiProvider] = useState<'auto' | 'openai' | 'ollama'>('auto');

  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | undefined>();

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<{ text: string; takeaways: string[] }>({ text: '', takeaways: [] });
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);

  const { showToast } = useToast();
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    documentService.getDocuments().then(setDocuments).catch(() => {});
    roomService.getRooms().then(setRooms).catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      session_id: sessionId || 0,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      setLoading(true);
      const res = await aiService.chat(userText, sessionId, selectedDocId, selectedRoomId, aiProvider);
      setSessionId(res.session_id);

      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        session_id: res.session_id,
        role: 'assistant',
        content: res.response,
        sources: res.sources,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      showToast('Error communicating with AI service', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      showToast('Generating AI Summary...', 'info');
      const res = await aiService.summarize(selectedDocId, selectedRoomId);
      setSummaryData({ text: res.summary, takeaways: res.key_takeaways });
      setIsSummaryOpen(true);
    } catch (e) {
      showToast('Failed to generate summary', 'error');
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      showToast('Synthesizing Quiz questions...', 'info');
      const res = await aiService.generateQuiz(selectedDocId, selectedRoomId, 5);
      setQuizQuestions(res.questions);
      setIsQuizOpen(true);
    } catch (e) {
      showToast('Failed to generate quiz', 'error');
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      showToast('Building Active Recall Flashcards...', 'info');
      const res = await aiService.generateFlashcards(selectedDocId, selectedRoomId, 6);
      setFlashcards(res.cards);
      setIsFlashcardsOpen(true);
    } catch (e) {
      showToast('Failed to generate flashcards', 'error');
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-80 flex flex-col gap-4 flex-shrink-0">
        <Card className="flex-1 flex flex-col overflow-hidden p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
            <Layers className="w-4 h-4 mr-1.5 text-blue-600" /> Active AI Context
          </h3>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Engine Provider</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-blue-50/50"
              >
                <option value="auto">Auto (Smart Provider Selection)</option>
                <option value="openai">ChatGPT / OpenAI (GPT-4o)</option>
                <option value="ollama">Ollama (Local LLM)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Document</label>
              <select
                value={selectedDocId || ''}
                onChange={(e) => {
                  setSelectedDocId(e.target.value ? parseInt(e.target.value, 10) : undefined);
                  setSelectedRoomId(undefined);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">All Documents (General)</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Or Study Room</label>
              <select
                value={selectedRoomId || ''}
                onChange={(e) => {
                  setSelectedRoomId(e.target.value ? parseInt(e.target.value, 10) : undefined);
                  setSelectedDocId(undefined);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">None (Document Only)</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Instant Generators</p>
            <Button variant="soft" size="sm" onClick={handleGenerateSummary} className="w-full justify-start text-xs">
              <FileText className="w-3.5 h-3.5 mr-2 text-blue-600" /> Generate Summary Notes
            </Button>
            <Button variant="soft" size="sm" onClick={handleGenerateQuiz} className="w-full justify-start text-xs">
              <HelpCircle className="w-3.5 h-3.5 mr-2 text-amber-600" /> Create 5-Question Quiz
            </Button>
            <Button variant="soft" size="sm" onClick={handleGenerateFlashcards} className="w-full justify-start text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Create Flashcards
            </Button>
          </div>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                {selectedDocId
                  ? `Chatting with: ${documents.find(d => d.id === selectedDocId)?.title || 'Document'}`
                  : selectedRoomId
                  ? `Room Context: ${rooms.find(r => r.id === selectedRoomId)?.name || 'Study Room'}`
                  : 'StudySphere Academic Assistant'}
              </h3>
              <p className="text-[10px] text-slate-400">RAG Grounded Retrieval • {aiProvider === 'openai' ? 'OpenAI GPT-4o' : aiProvider === 'ollama' ? 'Ollama' : 'Auto AI'}</p>
            </div>
          </div>

          <Button size="sm" variant="ghost" onClick={() => setMessages([])} title="Clear Chat">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]/50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto py-12">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Ask anything about your study material</h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                "Explain IAM in simple terms", "Give me 5 key takeaways", or "What should I revise for the midterm?"
              </p>
              <div className="space-y-1.5 w-full">
                {["Explain IAM Least Privilege and RBAC", "Give me the 5 most important concepts", "Create 5 MCQs on this material"].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputMessage(prompt);
                    }}
                    className="w-full text-xs text-slate-600 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 p-2.5 rounded-xl text-left transition-colors truncate"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
                  m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-blue-600'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] whitespace-pre-line'
              }`}>
                {m.content}

                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cited Sources:</p>
                    {m.sources.map((src, i) => (
                      <div key={i} className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded-lg">
                        <strong>Page {src.page_number || 1}:</strong> {src.excerpt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Bot className="w-4 h-4 animate-spin text-blue-500" />
              <span>StudySphere AI is thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question about your uploaded materials..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Button type="submit" size="md" variant="primary" disabled={!inputMessage.trim() || loading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        title="Interactive Practice Quiz"
        questions={quizQuestions}
      />
      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        summaryText={summaryData.text}
        keyTakeaways={summaryData.takeaways}
      />
      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        cards={flashcards}
      />
    </div>
  );
};
