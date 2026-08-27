import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { roomService } from '../services/allServices';
import { StudyRoom } from '../types';
import { CreateRoomModal } from '../components/rooms/CreateRoomModal';

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadRooms = () => {
    roomService.getRooms().then(setRooms).catch(() => {});
  };

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <div className="space-y-6">
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          loadRooms();
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Collaborative Study Rooms</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Study together with peers, share document vaults, and chat in real-time.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Room
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            onClick={() => navigate(`/rooms/${room.id}`)}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs text-sm"
                  style={{ backgroundColor: room.color || '#3B82F6' }}
                >
                  {room.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {room.members?.length || 1} members
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{room.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{room.subject}</p>
              {room.description && (
                <p className="text-[11px] text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {room.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>Enter Room</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
