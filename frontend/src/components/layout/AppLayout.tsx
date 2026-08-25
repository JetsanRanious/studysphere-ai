import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { EyeRestModal } from '../timer/EyeRestModal';
import { CreateRoomModal } from '../rooms/CreateRoomModal';

export const AppLayout: React.FC = () => {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar onOpenCreateRoom={() => setIsCreateRoomOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Wellness Eye Rest Reminder Trigger */}
      <EyeRestModal />

      {/* Global Quick Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreated={() => {
          setIsCreateRoomOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};
