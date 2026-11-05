import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User as UserIcon,
  Eye,
  Phone,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { User } from '../lib/types';
import { GenderAvatar } from './GenderAvatar';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenProfileModal: () => void;
  onOpenTeacherProfile: (userId: string) => void;
  onLogout: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  theme,
  onToggleTheme,
  onOpenProfileModal,
  onOpenTeacherProfile,
  onLogout,
}) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Render into document.body via Portal → bypasses any parent backdrop-filter/transform
  return createPortal(
    <div
      className="sm:hidden fixed inset-0 z-[100] flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-72 max-w-[85vw] h-full bg-[#111827] border-l border-blue-900/50 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <GenderAvatar
                gender={currentUser.gender || 'MALE'}
                role={currentUser.role}
                size="sm"
              />
              <div>
                <div className="font-bold text-sm text-white line-clamp-1">
                  {currentUser.fullName}
                </div>
                <div className="text-[11px] text-blue-400 font-mono">
                  {currentUser.role === 'STUDENT' ? 'Student' : 'Tutor'} &bull; {currentUser.district}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="p-3 rounded-2xl bg-[#0B0F19] border border-blue-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              Switch
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfileModal();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800/80 transition-colors text-left"
            >
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>Profile &amp; Location Settings</span>
            </button>

            {currentUser.role === 'TUTOR' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTeacherProfile(currentUser.id);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800/80 transition-colors text-left"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>View Public Profile</span>
              </button>
            )}

            <a
              href="https://wa.me/8801642695161?text=Hello%20Porabo%20Support%2C%20I%20have%20a%20feedback%20or%20complain"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-emerald-400 hover:bg-emerald-950/40 transition-colors text-left"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Feedback &amp; Complaints</span>
            </a>
          </div>
        </div>

        {/* Drawer Footer with Sign Out */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
          <div className="text-[10px] text-center text-slate-500 font-mono">
            Porabo &copy; 2026 &bull; Hyper-Local Radius
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};