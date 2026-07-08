import React, { useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LucideIcon } from '../LucideIcon';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose }) => {
  const { setActiveModal, addNotification } = useWorkspace();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (modalType: 'profile' | 'settings' | 'about') => {
    setActiveModal(modalType);
    onClose();
  };

  const handleLogout = () => {
    addNotification('warning', 'Logout triggered (placeholder action)');
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-56 rounded-xl border border-[#1a1c36] bg-[#0b0c1e]/95 backdrop-blur-md text-gray-200 shadow-2xl z-50 py-1.5 animate-fade-in"
      style={{ top: '100%' }}
    >
      {/* Header Info */}
      <div className="px-4 py-2.5 border-b border-[#14152a] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow">
          U
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-200 truncate">Administrator</p>
          <p className="text-[9px] text-gray-500 truncate">admin@forge.dev</p>
        </div>
      </div>

      {/* Menu Options */}
      <div className="p-1 space-y-0.5">
        <button
          onClick={() => handleAction('profile')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-[#14152a]/70 transition-all cursor-pointer text-left"
        >
          <LucideIcon name="User" size={14} className="text-purple-400" />
          User Profile
        </button>

        <button
          onClick={() => handleAction('settings')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-[#14152a]/70 transition-all cursor-pointer text-left"
        >
          <LucideIcon name="Settings" size={14} className="text-indigo-400" />
          Settings
        </button>

        <button
          onClick={() => handleAction('about')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-[#14152a]/70 transition-all cursor-pointer text-left"
        >
          <LucideIcon name="HelpCircle" size={14} className="text-pink-400" />
          About Forge
        </button>
      </div>

      <div className="border-t border-[#14152a] my-1" />

      {/* Logout */}
      <div className="p-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-left"
        >
          <LucideIcon name="LogOut" size={14} />
          Logout
        </button>
      </div>
    </div>
  );
};
