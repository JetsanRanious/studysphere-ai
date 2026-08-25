import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Users, FileText, FolderKanban, Trash2, ArrowRight, KeyRound } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { CreateRoomModal } from '../components/rooms/CreateRoomModal';
import { roomService } from '../services/allServices';
import { StudyRoom } from '../types';
import { useToast } from '../contexts/ToastContext';

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (e) {
      showToast('Error loading study rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setJoinLoading(true);
      const joinedRoom = await roomService.joinRoomByCode(joinCode.trim());
      showToast(`Successfully joined room '${joinedRoom.name}'! +25 XP 🎉`, 'success');
      setIsJoinOpen(false);
      setJoinCode('');
      navigate(`/rooms/${joinedRoom.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Invalid room invite code', 'error');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this study room?')) return;
    try {
      await roomService.deleteRoom(id);
      showToast('Room deleted', 'info');
      loadRooms();
    } catch (e) {
      showToast('Failed to delete room', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Study Rooms</h1>
          <p className="text-xs text-slate-500 mt-0.5">Separate coursework by subject, share invite codes, and study together</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsJoinOpen(true)}>
            <KeyRound className="w-4 h-4 mr-1.5 text-blue-600" /> Join with Code
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Create Room
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card
            key={room.id}
            hoverable
            className="cursor-pointer flex flex-col justify-between"
            onClick={() => navigate(`/rooms/${room.id}`)}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                  style={{ backgroundColor: room.color || '#3B82F6' }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                    {room.invite_code ? room.invite_code : 'SPHERE-' + room.id}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, room.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{room.name}</h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                {room.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-3">
                <span className="flex items-center"><FolderKanban className="w-3.5 h-3.5 mr-1 text-slate-400" /> {room.topic_count} Topics</span>
                <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-1 text-slate-400" /> {room.document_count} Docs</span>
              </div>
              <span className="text-blue-600 font-semibold flex items-center">
                Enter <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          loadRooms();
        }}
      />

      <Modal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} title="Join Study Room with Code">
        <form onSubmit={handleJoinByCode} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Enter Room Invite Code</label>
            <input
              type="text"
              required
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. SPHERE-4921"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Ask your friend or room administrator for their room code (e.g. SPHERE-1234) to join and collaborate.
          </p>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsJoinOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={joinLoading}>Join Room</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
