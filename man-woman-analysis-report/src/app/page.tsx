'use client';

import { useState } from 'react';
import { TabsNavigation } from '@/components/layout/TabsNavigation';
import { HomeFeed } from '@/components/home/HomeFeed';
import { StoryLog, StoryEpisode } from '@/components/story/StoryLog';
import { TopBannerAd, InFeedAd } from '@/components/ads/Ads';
import { sampleEpisodes } from '@/data/storyData';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStory, setSelectedStory] = useState<StoryEpisode | null>(null);

  // 스토리 읽기 핸들러 (홈에서 스토리 클릭 시)
  const handleReadStory = (episode: StoryEpisode) => {
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
          <HomeFeed onReadStory={handleReadStory} />
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
          <div className="py-16 px-4 text-center">
            <h2 className="text-hero text-gray-900 mb-4 font-serif">전체 스토리</h2>
            <p className="text-body-lg text-gray-500 mb-12">남녀의 관점 차이를 보여주는 모든 에피소드입니다.</p>
            <div className="max-w-4xl mx-auto text-left">
              {/* HomeFeed의 리스트 뷰를 재사용하거나 별도 구현 */}
              {sampleEpisodes.map((episode) => (
                <div key={episode.id} className="mb-12 border-b border-gray-100 pb-12 cursor-pointer group" onClick={() => handleReadStory(episode)}>
                  <h3 className="text-title font-serif group-hover:text-pink-600 transition-colors mb-4">{episode.title}</h3>
                  <p className="text-body text-gray-600 mb-6">{episode.situation}</p>
                  <span className="text-pink-600 border border-pink-200 bg-pink-50 px-4 py-2 rounded-full text-body-sm font-bold">스토리 읽기 →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 준비 중인 탭들 */}
        {(activeTab === 'analysis' || activeTab === 'picks') && (
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
