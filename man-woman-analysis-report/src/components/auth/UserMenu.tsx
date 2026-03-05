'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { LoginModal } from './LoginModal';

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  // 비로그인 상태
  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-bold transition-colors shadow-sm"
        >
          <UserIcon className="w-4 h-4" />
          로그인
        </button>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  // 로그인 상태
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '사용자';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const provider = user.app_metadata?.provider;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-gray-100 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:inline max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {/* 드롭다운 메뉴 */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
              {provider && (
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-medium text-gray-500 capitalize">
                  {provider === 'google' ? '🔷 Google' : provider === 'kakao' ? '💛 Kakao' : provider}
                </span>
              )}
            </div>
            <button
              onClick={async () => {
                setShowDropdown(false);
                await signOut();
              }}
              className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}
