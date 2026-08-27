import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Send, ArrowLeft, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { roomService } from '../services/allServices';
import { StudyRoom, RoomChatMessage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useStudyTimer } from '../contexts/StudyTimerContext';

export const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startSession } = useStudyTimer();

  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [messages, setMessages] = useState<RoomChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomId = Number(id);

  useEffect(() => {
    if (!roomId) return;
    roomService.getRoom(roomId).then(setRoom).catch(() => {});
    roomService.getRoomMessages(roomId).then(setMessages).catch(() => {});
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !roomId) return;
    const msgText = inputMsg.trim();
    setInputMsg('');

    try {
      const newMsg = await roomService.sendRoomMessage(roomId, msgText);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      // Optimistic message append
      const optMsg: RoomChatMessage = {
        id: Date.now(),
        room_id: roomId,
        user_id: user?.id || 1,
        user_name: user?.full_name || 'Scholar',
        user_avatar: user?.avatar_url || '',
        content: msgText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optMsg]);
    }
  };

  if (!room) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading study room details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/rooms')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{room.name}</h1>
            <p className="text-xs text-slate-500">{room.subject} • {room.members?.length || 1} participants</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => startSession(room.subject)}
        >
          <Clock className="w-4 h-4 mr-1.5" /> Start Focus Session (45m)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat / Discussion */}
        <Card className="lg:col-span-2 flex flex-col h-[500px] p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Room Chat</h3>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" /> Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]/50">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No messages yet. Say hi to your fellow study partners!
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.user_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <p className={`text-[10px] font-semibold mb-0.5 ${isMe ? 'text-right text-blue-600' : 'text-slate-500'}`}>
                        {m.user_name}
                      </p>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask a question or share notes..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </Card>

        {/* Room Info / Members */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Room Members</h3>
            <div className="space-y-2.5">
              {room.members?.map((m) => (
                <div key={m.id} className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {m.full_name?.substring(0, 2).toUpperCase() || 'ST'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{m.full_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
