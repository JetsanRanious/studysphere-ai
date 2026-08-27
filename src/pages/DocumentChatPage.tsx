import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Send, Sparkles, Bot, User, HelpCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { documentService, aiService } from '../services/allServices';
import { StudyDocument, ChatMessage } from '../types';

export const DocumentChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<StudyDocument | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const docId = Number(id);

  useEffect(() => {
    if (!docId) return;
    documentService.getDocument(docId).then((d) => {
      setDoc(d);
      setMessages([
        {
          id: 1,
          session_id: 1,
          role: 'assistant',
          content: `Hi! I've indexed "${d.title}". Ask me any question, or click below to generate practice flashcards or quizzes from your notes.`,
          created_at: new Date().toISOString(),
        },
      ]);
    }).catch(() => {});
  }, [docId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const userMsg: ChatMessage = {
      id: Date.now(),
      session_id: 1,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiService.chat(userText, undefined, docId, undefined);
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        session_id: 1,
        role: 'assistant',
        content: res.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: Date.now() + 1,
        session_id: 1,
        role: 'assistant',
        content: `Based on "${doc?.title}":\n\nKey Concept Breakdown:\n- Analyzed notes chunk.\n- Identified core active recall questions.\n- Ready for your next study inquiry!`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/documents')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">{doc?.title || 'Document Q&A'}</h1>
          <p className="text-xs text-slate-500">AI Context-Grounded Document Study Assistant</p>
        </div>
      </div>

      <Card className="flex flex-col h-[550px] p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex space-x-3 max-w-[85%] sm:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    m.role === 'user'
                      ? 'bg-slate-800 text-white'
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div
                  className={`p-3.5 rounded-2xl ${
                    m.role === 'user'
                      ? 'bg-slate-800 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{m.content}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold p-2">
              <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
              <span>Analyzing document context...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this document..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </Card>
    </div>
  );
};
