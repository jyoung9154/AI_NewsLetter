'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGoogle, signInWithKakao } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💑</div>
          <h2 className="text-xl font-bold text-gray-900">남녀분석보고서</h2>
          <p className="text-gray-500 text-sm mt-2">소셜 계정으로 간편하게 로그인하세요</p>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="space-y-3">
          {/* Google 로그인 */}
          <button
            onClick={async () => {
              await signInWithGoogle();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all font-medium text-gray-700 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 계속하기
          </button>

          {/* Kakao 로그인 */}
          <button
            onClick={async () => {
              await signInWithKakao();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#FEE500] border-2 border-[#FEE500] rounded-2xl hover:bg-[#F4DC00] transition-all font-medium text-[#3C1E1E] shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#3C1E1E"
                d="M12 3C6.48 3 2 6.36 2 10.5c0 2.69 1.81 5.05 4.53 6.39l-1.15 4.23a.3.3 0 0 0 .45.33l4.93-3.28c.4.04.81.06 1.24.06 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"
              />
            </svg>
            카카오로 계속하기
          </button>
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          로그인하면 서비스 이용약관 및<br />개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
