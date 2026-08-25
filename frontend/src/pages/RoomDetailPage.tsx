import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FolderKanban,
  FileText,
  Bot,
  Plus,
  Play,
  ArrowLeft,
  Trash2,
  UploadCloud,
  Copy,
  Users,
  MessageSquare,
  Send
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { roomService, documentService } from '../services/allServices';
import { StudyRoom, StudyDocument, RoomChatMessage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useStudyTimer } from '../contexts/StudyTimerContext';

export const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { startSession } = useStudyTimer();

  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [messages, setMessages] = useState<RoomChatMessage[]>([]);
  const [newChatText, setNewChatText] = useState('');
  const [activeTab, setActiveTab] = useState<'topics' | 'chat'>('topics');
  const [newTopicName, setNewTopicName] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    try {
      const roomData = await roomService.getRoom(roomId);
      setRoom(roomData);
      const docsData = await documentService.getDocuments(roomId);
      setDocuments(docsData);
      const msgs = await roomService.getRoomMessages(roomId);
      setMessages(msgs);
    } catch (e) {
      showToast('Error loading study room details', 'error');
    }
  };

  useEffect(() => {
    if (roomId) loadData();
  }, [roomId]);

  const handleCopyCode = () => {
    if (room?.invite_code) {
      navigator.clipboard.writeText(room.invite_code);
      showToast(`Room invite code '${room.invite_code}' copied to clipboard! Share with friends.`, 'success');
    }
  };

  const handleSendRoomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    try {
      const res = await roomService.sendRoomMessage(roomId, newChatText.trim());
      setMessages(prev => [...prev, res]);
      setNewChatText('');
    } catch (e) {
      showToast('Failed to send message', 'error');
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    try {
      await roomService.addTopic(roomId, newTopicName);
      setNewTopicName('');
      showToast('Subtopic added!', 'success');
      loadData();
    } catch (e) {
      showToast('Failed to add topic', 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await documentService.uploadDocument(file, file.name.split('.')[0], roomId);
      showToast(`Uploaded '${file.name}' to ${room?.name}! +25 XP`, 'success');
      loadData();
    } catch (e) {
      showToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (!room) return <div className="p-8 text-center text-slate-400">Loading study room...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/rooms')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
            style={{ backgroundColor: room.color || '#3B82F6' }}
          >
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{room.name}</h1>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
                title="Click to copy room invite code"
              >
                <span>Code: {room.invite_code ? room.invite_code : 'SPHERE-' + room.id}</span>
                <Copy className="w-3 h-3 text-blue-600" />
              </button>
            </div>
            <p className="text-xs text-slate-500">{room.subject} • {room.topics?.length || 0} Subtopics • {documents.length} Docs</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button variant="outline" size="sm" onClick={() => navigate(`/chat?roomId=${room.id}`)}>
            <Bot className="w-4 h-4 mr-1.5 text-blue-600" /> Chat with Room AI
          </Button>
          <Button variant="primary" size="sm" onClick={() => startSession(room.name, room.id)}>
            <Play className="w-4 h-4 mr-1.5" /> Start Study Session
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('topics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'topics'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5 inline mr-1.5" />
          Syllabus & Documents
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
          Friend Group Chat 💬
          {messages.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
              {messages.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'topics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                <FolderKanban className="w-4 h-4 mr-1.5 text-blue-600" /> Course Syllabus Subtopics
              </h3>

              <form onSubmit={handleAddTopic} className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Add new topic (e.g., Module 4: Protocol Security)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <Button type="submit" size="sm" variant="primary">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </form>

              <div className="space-y-2">
                {room.topics?.map((topic, idx) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-[#F8FAFC] hover:bg-white hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{topic.name}</span>
                    </div>

                    <button
                      onClick={async () => {
                        await roomService.deleteTopic(roomId, topic.id);
                        loadData();
                      }}
                      className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-blue-600" /> Room Documents & PDF Notes
                </h3>
                <label className="cursor-pointer">
                  <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.doc,.txt" className="hidden" />
                  <span className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    {uploading ? 'Processing...' : 'Upload Doc'}
                  </span>
                </label>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                  <UploadCloud className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No documents uploaded to this room yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-[#F8FAFC] hover:bg-white hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xs uppercase font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          {doc.file_type}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{doc.title}</h4>
                          <p className="text-[11px] text-slate-400">{(doc.file_size_bytes / 1024).toFixed(1)} KB • {doc.chunk_count} RAG chunks</p>
                        </div>
                      </div>

                      <Button size="sm" variant="ghost" onClick={() => navigate(`/chat?docId=${doc.id}`)}>
                        <Bot className="w-3.5 h-3.5 mr-1" /> Ask AI
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-blue-600" /> Share Room with Friends
              </h4>
              <p className="text-xs text-blue-800 mb-3 leading-relaxed">
                Give this code to classmates so they can join this room, share documents, and study together:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={room.invite_code ? room.invite_code : 'SPHERE-' + room.id}
                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-blue-200 text-xs font-mono font-bold text-blue-900 select-all"
                />
                <Button size="sm" variant="primary" onClick={handleCopyCode}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>

            <Card>
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-slate-500" /> Study Members ({room.members?.length || 1})
              </h4>
              <div className="space-y-2.5">
                {room.members?.map((m) => (
                  <div key={m.id} className="flex items-center space-x-3">
                    <img
                      src={m.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.full_name}`}
                      alt="avatar"
                      className="w-7 h-7 rounded-full bg-blue-100"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800">{m.full_name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-0 overflow-hidden flex flex-col h-[520px]">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Live Group Discussion: {room.name}
            </span>
            <span className="text-[11px] text-slate-400">{messages.length} messages</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-white">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <MessageSquare className="w-10 h-10 text-slate-200 mb-2" />
                <p className="text-xs font-medium">No messages yet in this study room.</p>
                <p className="text-[11px] text-slate-400">Say hello to your classmates!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.user_id === user?.id;
                return (
                  <div key={msg.id} className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <img
                      src={msg.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user_name}`}
                      alt="avatar"
                      className="w-7 h-7 rounded-full bg-blue-100 flex-shrink-0"
                    />
                    <div className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      {!isMe && <p className="text-[10px] font-bold text-blue-700 mb-0.5">{msg.user_name}</p>}
                      <p>{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendRoomMessage} className="p-3 border-t border-slate-100 bg-slate-50 flex items-center space-x-2">
            <input
              type="text"
              value={newChatText}
              onChange={e => setNewChatText(e.target.value)}
              placeholder={`Message friends in ${room.name}...`}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
            <Button type="submit" size="sm" variant="primary">
              <Send className="w-3.5 h-3.5 mr-1" /> Send
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
