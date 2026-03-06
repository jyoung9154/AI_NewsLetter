'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TabsNavigation } from '@/components/layout/TabsNavigation';
import { HomeFeed } from '@/components/home/HomeFeed';
import { StoryList } from '@/components/story/StoryList';
import { TopBannerAd } from '@/components/ads/Ads';
import { MBTIAnalyzer } from '@/components/analysis/MBTIAnalyzer';
import { TestHub } from '@/components/tests/TestHub';
import { TarotCardPicker } from '@/components/tests/TarotCardPicker';
import { DbEpisode } from '@/types';

interface HomeContentProps {
    episodes: DbEpisode[];
}

function HomeContentInner({ episodes }: HomeContentProps) {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        // 초기 탭 결정: URL 파라미터 기반
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('result')) return 'analysis';
        }
        return 'home';
    });
    const [selectedTest, setSelectedTest] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-pink-100 selection:text-pink-900">
            {/* 1. GNB 탭 네비게이션 (Sticky) */}
            <TabsNavigation currentTab={activeTab} onTabChange={(tab) => {
                setActiveTab(tab);
                setSelectedTest(null); // 탭 이동 시 선택된 테스트 초기화
                window.scrollTo({ top: 0, behavior: 'auto' });
            }} />

            {/* 2. 최상단 구글 애드센스 (네비게이션 하단에 위치) */}
            <TopBannerAd />

            {/* 3. 탭별 메인 콘텐츠 렌더링 영역 */}
            <main className="min-h-[70vh]">
                {activeTab === 'home' && (
                    <HomeFeed episodes={episodes} />
                )}

                {/* 스토리 탭 (리스트만 모아보기) */}
                {activeTab === 'story' && (
                    <StoryList episodes={episodes} />
                )}

                {/* 심리 분석 탭 (MBTI 궁합 분석기) */}
                {activeTab === 'analysis' && (
                    <MBTIAnalyzer />
                )}

                {/* 심리테스트 탭 (타로, MBTI 테스트 등) */}
                {activeTab === 'tests' && (
                    <>
                        {!selectedTest ? (
                            <TestHub onSelectTest={(id) => {
                                if (id === 'compatibility') {
                                    setActiveTab('analysis');
                                } else {
                                    setSelectedTest(id);
                                }
                            }} />
                        ) : (
                            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
                                <button
                                    onClick={() => setSelectedTest(null)}
                                    className="mb-8 text-pink-600 font-bold flex items-center hover:underline"
                                >
                                    ← 전체 테스트 목록으로
                                </button>

                                {selectedTest === 'tarot' ? (
                                    <TarotCardPicker />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <div className="text-6xl mb-6">🛠️</div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">테스트 준비 중</h2>
                                        <p className="text-gray-500 max-w-md">
                                            이 테스트는 현재 개발 중입니다. 곧 만나보실 수 있습니다!
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* 준비 중인 탭들 (추천템 등) */}
                {activeTab === 'picks' && (
                    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                        <div className="text-6xl mb-6">🛠️</div>
                        <h2 className="text-title text-gray-900 mb-2">콘텐츠 준비 중입니다</h2>
                        <p className="text-body-lg text-gray-500 max-w-md">
                            더 깊이 있는 분석과 퀄리티 높은 추천 아이템을<br />가져오기 위해 열심히 작업하고 있어요!
                        </p>
                        <button
                            onClick={() => setActiveTab('home')}
                            className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-full text-section hover:bg-gray-800 transition-colors"
                        >
                            홈으로 돌아가기
                        </button>
                    </div>
                )}
            </main>

            {/* 4. 전역 푸터 영역 */}
            <footer className="bg-gray-50 border-t border-gray-100 py-12 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-body-sm text-gray-500">
                    <div>
                        <span className="font-serif text-section text-gray-900 block mb-2">남녀분석보고서</span>
                        <p>© 2026 Man/Woman Analysis Report. All rights reserved.</p>
                    </div>
                    <div className="flex gap-6">
                        <span className="hover:text-gray-900 cursor-pointer">이용약관</span>
                        <span className="hover:text-gray-900 cursor-pointer">개인정보처리방침</span>
                        <span className="hover:text-gray-900 cursor-pointer">광고/제휴 문의</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export function HomeContent({ episodes }: HomeContentProps) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <HomeContentInner episodes={episodes} />
        </Suspense>
    );
}
