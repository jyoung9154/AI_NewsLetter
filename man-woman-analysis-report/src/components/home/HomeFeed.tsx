'use client';

import { useState } from 'react';
import { DbEpisode } from '@/types';
import { InFeedAd } from '@/components/ads/Ads';

interface HomeFeedProps {
    episodes: DbEpisode[];
    onReadStory: (episode: DbEpisode) => void;
}

export function HomeFeed({ episodes, onReadStory }: HomeFeedProps) {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscribeMessage, setSubscribeMessage] = useState('');

    const handleSubscribe = async () => {
        if (!email) {
            setSubscribeMessage('이메일을 입력해주세요.');
            return;
        }

        setIsSubscribing(true);
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, gender: 'both' }) // 간편 구독은 기본값
            });
            const data = await res.json();

            if (res.ok || data.message === 'Already subscribed') {
                setSubscribeMessage('구독이 완료되었습니다! 🎉');
                setEmail('');
            } else {
                setSubscribeMessage(data.error || '구독에 실패했습니다.');
            }
        } catch (e) {
            setSubscribeMessage('오류가 발생했습니다.');
        } finally {
            setIsSubscribing(false);
            setTimeout(() => setSubscribeMessage(''), 5000);
        }
    };

    // 로딩 처리나 에피소드가 없을 경우
    if (!episodes || episodes.length === 0) {
        return <div className="py-20 text-center text-gray-500">에피소드를 불러오는 중입니다...</div>;
    }

    // 최신 에피소드 하나를 메인(Hero) 커버로 사용
    const latestEpisode = episodes[0];
    // 나머지 에피소드를 리스트로 사용
    const previousEpisodes = episodes.slice(1);

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">

            {/* 1. 메인 매거진 커버 (Hero Post) */}
            <div
                className="group cursor-pointer relative w-full h-[400px] md:h-[480px] rounded-3xl overflow-hidden mb-12 shadow-lg border border-gray-200"
                onClick={() => onReadStory(latestEpisode)}
            >
                {/* 임시 커버 이미지 처리 */}
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-300 via-pink-400 to-fuchsia-400 flex items-center justify-center">
                    <span className="text-8xl opacity-10">💬</span>
                </div>

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                {/* 콘텐츠 정보 */}
                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                    <div className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-body-sm font-bold uppercase tracking-wider inline-block mb-4">
                        이번 주 최신 이야기
                    </div>
                    <h2 className="text-hero md:text-[3rem] font-serif text-white mb-4 leading-tight group-hover:underline decoration-2 underline-offset-4 decoration-pink-400">
                        {latestEpisode.title}
                    </h2>
                    <p className="text-gray-200 text-body md:text-body-lg line-clamp-2 md:line-clamp-3 max-w-2xl font-medium leading-relaxed">
                        {latestEpisode.situation}
                    </p>
                </div>
            </div>

            {/* 2. 어피티 스타일 - 구독 유도 중간 배너 */}
            <div className="my-12 bg-gray-900 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-lg">
                {/* 장식 요소 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                    <h3 className="text-title md:text-hero mb-4">화성 남자와 금성 여자의 번역기</h3>
                    <p className="text-gray-300 text-body-lg mb-8 max-w-xl mx-auto">
                        이해하기 어려운 속마음, 우리가 번역해 드립니다.<br />매주 금요일 아침 8시, 여러분의 메일함으로 찾아갈게요.
                    </p>
                    <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일 주소를 입력해주세요"
                            className="flex-1 px-5 py-4 rounded-xl text-gray-900 bg-white border-0 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                        <button
                            onClick={handleSubscribe}
                            disabled={isSubscribing}
                            className="bg-pink-600 hover:bg-pink-500 disabled:bg-pink-400 text-white font-bold py-4 px-8 rounded-xl transition-colors whitespace-nowrap shadow-md"
                        >
                            {isSubscribing ? '처리 중...' : '무료 구독'}
                        </button>
                    </div>
                    {subscribeMessage && (
                        <p className={`mt-4 text-sm font-bold ${subscribeMessage.includes('실패') || subscribeMessage.includes('오류') ? 'text-red-400' : 'text-green-400'}`}>
                            {subscribeMessage}
                        </p>
                    )}
                </div>
            </div>

            {/* 3. 리스트 피드 (이전 스토리 & 네이티브 광고) */}
            <div className="mt-16">
                <h3 className="text-section font-serif text-gray-900 mb-8 border-b-2 border-gray-900 pb-4 inline-block">지난 이야기 모아보기</h3>

                <div className="space-y-10">
                    {previousEpisodes.map((episode) => (
                        <div
                            key={episode.id}
                            className="group cursor-pointer flex flex-col sm:flex-row gap-6 items-start hover:bg-gray-50 p-4 -mx-4 rounded-2xl transition-colors"
                            onClick={() => onReadStory(episode)}
                        >
                            {/* 작은 썸네일 박스 */}
                            <div className="w-full sm:w-48 aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                <div className="w-full h-full bg-gradient-to-br from-pink-50 to-white flex items-center justify-center text-gray-300 text-hero md:text-[3rem]">
                                    📖
                                </div>
                            </div>

                            {/* 리스트 텍스트 */}
                            <div className="flex-1 pr-4">
                                <span className="text-body-sm font-bold text-gray-400 uppercase tracking-widest block mb-2">스토리 로그</span>
                                <h4 className="text-section text-gray-900 mb-3 group-hover:text-blue-600 transition-colors font-serif">
                                    {episode.title}
                                </h4>
                                <p className="text-gray-600 text-body line-clamp-2 md:line-clamp-3 leading-relaxed">
                                    {episode.situation}
                                </p>
                                <div className="mt-4 flex gap-4">
                                    <div className="text-body-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">🙋‍♀️ 여자의 시점</div>
                                    <div className="text-body-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">🙍‍♂️ 남자의 시점</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* 리스트 끝부분에 In-Feed 광고 배치 */}
                    <div className="pt-8 border-t border-gray-100 mt-8">
                        <InFeedAd category="데이트 선물" />
                    </div>
                </div>
            </div>

        </div>
    );
}
