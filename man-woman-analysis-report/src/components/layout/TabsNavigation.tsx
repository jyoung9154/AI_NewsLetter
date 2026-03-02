'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SubscriptionPopup } from '@/components/subscription/SubscriptionPopup';

interface TabsNavigationProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

export function TabsNavigation({ currentTab, onTabChange }: TabsNavigationProps) {
    const tabs = [
        { id: 'home', label: '홈' },
        { id: 'story', label: '스토리' },
        { id: 'analysis', label: '심리 분석' },
        { id: 'picks', label: '추천템' }
    ];

    const [isExpanding, setIsExpanding] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [subscribedEmail, setSubscribedEmail] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubscribing(true);
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, interested_gender: 'both' })
            });

            if (res.ok) {
                setSubscribedEmail(email);
                setEmail('');
                setIsExpanding(false);
                setShowPopup(true);
            } else {
                const data = await res.json();
                alert(data.error || '구독에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('오류가 발생했습니다.');
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* 로고 */}
                    <div className="flex-shrink-0">
                        <Link href="/" onClick={(e) => { e.preventDefault(); onTabChange('home'); }} className="flex items-center gap-2">
                            <span className="text-2xl">📝</span>
                            <span className="text-section font-serif tracking-tight leading-none text-gray-900">
                                <span className="text-pink-600">남녀</span>분석보고서
                            </span>
                        </Link>
                    </div>

                    {/* 데스크탑 탭 네비게이션 */}
                    <nav className="hidden md:flex space-x-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`px-4 py-5 text-body font-semibold transition-all duration-200 border-b-2 ${currentTab === tab.id
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* 구독 필드 (데스크탑 우측) */}
                    <div className="hidden md:flex items-center">
                        {!isExpanding ? (
                            <button
                                onClick={() => setIsExpanding(true)}
                                className="bg-gray-900 hover:bg-gray-800 text-white text-body-sm font-semibold px-5 py-2 rounded-full transition-all shadow-sm whitespace-nowrap"
                            >
                                무료 뉴스레터 구독
                            </button>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="이메일 입력"
                                    autoFocus
                                    className="px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 w-48 transition-all"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubscribing}
                                    className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                                >
                                    {isSubscribing ? '...' : '구독'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsExpanding(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </form>
                        )}
                    </div>

                    {/* 모바일 햄버거 메뉴 (임시) */}
                    <div className="md:hidden flex items-center">
                        <button className="text-gray-500 hover:text-gray-900 p-2">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* 모바일 탭 네비게이션 (스크롤 가능) */}
            <div className="md:hidden border-t border-gray-100 bg-white">
                <div className="max-w-5xl mx-auto px-4 overflow-x-auto hide-scrollbar">
                    <nav className="flex space-x-6 min-w-max">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`py-3 text-body font-medium transition-colors border-b-2 whitespace-nowrap ${currentTab === tab.id
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {showPopup && (
                <SubscriptionPopup
                    email={subscribedEmail}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </header>
    );
}

