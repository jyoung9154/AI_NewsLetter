'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SubscriptionPopup } from '@/components/subscription/SubscriptionPopup';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserMenu } from '@/components/auth/UserMenu';

interface TabsNavigationProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

export function TabsNavigation({ currentTab, onTabChange }: TabsNavigationProps) {
    const { user } = useAuth();
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
    const [isSubscribedSuccess, setIsSubscribedSuccess] = useState(false);

    const handleSubscribe = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        let subEmail = email;
        if (user?.email) subEmail = user.email;

        if (!subEmail) return;

        setIsSubscribing(true);
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: subEmail, interested_gender: 'both' })
            });

            if (res.ok) {
                setSubscribedEmail(subEmail);
                setEmail('');
                setIsExpanding(false);
                if (user?.email) {
                    setIsSubscribedSuccess(true);
                    setTimeout(() => setIsSubscribedSuccess(false), 3000);
                } else {
                    setShowPopup(true);
                }
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

                    {/* 구독 필드 + 로그인 (데스크탑 우측) */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className={`relative h-10 flex items-center transition-all duration-500 ease-in-out ${isExpanding ? 'w-64' : 'w-32'}`}>
                            {/* 기본 버튼 - 서서히 사라짐 */}
                            <button
                                onClick={() => {
                                    if (user?.email) {
                                        handleSubscribe();
                                    } else {
                                        setIsExpanding(true);
                                    }
                                }}
                                disabled={isSubscribedSuccess}
                                className={`absolute inset-0 text-white text-body-sm font-semibold px-5 py-2 rounded-full transition-all duration-500 shadow-sm whitespace-nowrap flex items-center justify-center ${isExpanding ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'} ${isSubscribedSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-900 hover:bg-gray-800'}`}
                            >
                                {isSubscribedSuccess ? '구독 완료! ✅' : (isSubscribing && user?.email ? '처리 중...' : '구독하기')}
                            </button>

                            {/* 입력 폼 - 서서히 나타나며 확장 */}
                            <form
                                onSubmit={handleSubscribe}
                                className={`absolute inset-0 flex items-center gap-1 transition-all duration-500 ease-in-out ${isExpanding ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
                            >
                                <div className="relative flex-1">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="이메일 입력"
                                        autoFocus={isExpanding}
                                        className="w-full h-10 px-4 pr-10 border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubscribing}
                                        className="absolute right-1 top-1 h-8 w-8 bg-pink-600 hover:bg-pink-500 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                                    >
                                        {isSubscribing ? '...' : '→'}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsExpanding(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                        <UserMenu />
                    </div>

                    {/* 모바일 우측 */}
                    <div className="md:hidden flex items-center gap-2">
                        <UserMenu />
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

