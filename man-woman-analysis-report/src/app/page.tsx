'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TabsNavigation } from '@/components/layout/TabsNavigation';
import { HomeFeed } from '@/components/home/HomeFeed';
import { StoryLog } from '@/components/story/StoryLog';
import { StoryList } from '@/components/story/StoryList';
import { TopBannerAd, InFeedAd } from '@/components/ads/Ads';
import { MBTIAnalyzer } from '@/components/analysis/MBTIAnalyzer';
import { DbEpisode } from '@/types';

function HomeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStory, setSelectedStory] = useState<DbEpisode | null>(null);
  const [episodes, setEpisodes] = useState<DbEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/episodes')
      .then(res => res.json())
      .then(data => {
        const episodesList = Array.isArray(data) ? data : [];
        setEpisodes(episodesList);

        // Handle direct deep link to an episode via query parameter (?episode=episode_number)
        const targetEpisodeNumber = searchParams.get('episode');
        if (targetEpisodeNumber && episodesList.length > 0) {
          const targetEpisode = episodesList.find(ep => ep.episode_number?.toString() === targetEpisodeNumber);
          if (targetEpisode) {
            setSelectedStory(targetEpisode);
            setActiveTab('story-detail');
          }
        }

        // Handle MBTI result deep link (?result=base64_data)
        const hasMbtiResult = searchParams.get('result');
        if (hasMbtiResult) {
          setActiveTab('analysis');
        }

        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load episodes:', err);
        setIsLoading(false);
      });
  }, [searchParams]);

  // 스토리 읽기 핸들러 (홈에서 스토리 클릭 시)
  const handleReadStory = (episode: DbEpisode) => {
    setSelectedStory(episode);
    setActiveTab('story-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* 1. GNB 탭 네비게이션 (Sticky) */}
      <TabsNavigation currentTab={activeTab === 'story-detail' ? 'story' : activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedStory(null);
        window.scrollTo({ top: 0, behavior: 'auto' });
      }} />

      {/* 2. 최상단 구글 애드센스 (네비게이션 하단에 위치) */}
      <TopBannerAd />

      {/* 3. 탭별 메인 콘텐츠 렌더링 영역 */}
      <main className="min-h-[70vh]">
        {activeTab === 'home' && (
          isLoading ? (
            <div className="py-32 text-center text-gray-500 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
              에피소드를 불러오는 중입니다...
            </div>
          ) : (
            <HomeFeed episodes={episodes} onReadStory={handleReadStory} />
          )
        )}

        {/* 개별 스토리 읽기 뷰 */}
        {activeTab === 'story-detail' && selectedStory && (
          <div className="py-8 px-4 sm:px-6 max-w-5xl mx-auto">
            <button
              onClick={() => setActiveTab('home')}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              ← <span className="underline underline-offset-4">목록으로 돌아가기</span>
            </button>
            <StoryLog episode={selectedStory} />
            <div className="mt-12 border-t border-gray-100 pt-8">
              <InFeedAd category="화해 아이템" />
            </div>
          </div>
        )}

        {/* 스토리 탭 (리스트만 모아보기) */}
        {activeTab === 'story' && (
          <StoryList episodes={episodes} onReadStory={handleReadStory} />
        )}

        {/* 심리 분석 탭 (MBTI 궁합 분석기) */}
        {activeTab === 'analysis' && (
          <MBTIAnalyzer />
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
