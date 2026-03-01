'use client';

import { useState } from 'react';
import { DbEpisode } from '@/types';
import { InFeedAd } from '@/components/ads/Ads';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface HomeFeedProps {
    episodes: DbEpisode[];
    onReadStory: (episode: DbEpisode) => void;
}

export function HomeFeed({ episodes, onReadStory }: HomeFeedProps) {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscribeMessage, setSubscribeMessage] = useState('');

    // 팝업 관련 상태
    const [showPopup, setShowPopup] = useState(false);
    const [subscribedEmail, setSubscribedEmail] = useState('');
    const [selectedMyGender, setSelectedMyGender] = useState<string>('');
    const [selectedMbti, setSelectedMbti] = useState<string>('');
    const [selectedInterestedMbti, setSelectedInterestedMbti] = useState<string>('');
    const [selectedAge, setSelectedAge] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleSubscribe = async () => {
        console.log('[HomeFeed] handleSubscribe called with e-mail:', email);
        if (!email) {
            console.log('[HomeFeed] no email provided, returning.');
            setSubscribeMessage('이메일을 입력해주세요.');
            return;
        }

        setIsSubscribing(true);
        try {
            console.log('[HomeFeed] Calling /api/subscribe...');
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, interested_gender: 'both' }) // 간편 구독은 기본값
            });
            const data = await res.json();
            console.log('[HomeFeed] API response status:', res.status, 'data:', data);

            if (res.ok) {
                console.log('[HomeFeed] Subscription successful. Opening popup.');
                setSubscribedEmail(email);
                setEmail('');
                setShowPopup(true);
            } else {
                console.error('[HomeFeed] Subscription failed:', data.error);
                setSubscribeMessage(data.error || '구독에 실패했습니다.');
                setTimeout(() => setSubscribeMessage(''), 5000);
            }
        } catch (e) {
            console.error('[HomeFeed] Catch block error:', e);
            setSubscribeMessage('오류가 발생했습니다.');
            setTimeout(() => setSubscribeMessage(''), 5000);
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleExtraInfoSubmit = async () => {
        setIsUpdating(true);
        try {
            await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: subscribedEmail,
                    my_gender: selectedMyGender || undefined,
                    mbti: selectedMbti || undefined,
                    interested_mbti: selectedInterestedMbti || undefined,
                    age_group: selectedAge || undefined
                })
            });
            setSubscribeMessage('추가 정보가 성공적으로 저장되었습니다! 💖');
        } catch (e) {
            console.error(e);
            setSubscribeMessage('추가 정보 저장에 실패했습니다.');
        } finally {
            setIsUpdating(false);
            setShowPopup(false);
            setTimeout(() => setSubscribeMessage(''), 5000);
        }
    };

    // episodes가 있을 때만 Hero/List 섹션 표시
    const hasEpisodes = Array.isArray(episodes) && episodes.length > 0;
    const latestEpisode = hasEpisodes ? episodes[0] : null;
    const previousEpisodes = hasEpisodes ? episodes.slice(1) : [];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">

            {/* 1. 메인 매거진 커버 (Hero Post) - 에피소드 있을 때만 표시 */}
            {hasEpisodes && latestEpisode && (
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
            )}

            {/* 2. 어피티 스타일 - 구독 유도 중간 배너 */}
            <div id="subscribe-section" className="my-12 bg-gray-900 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-lg">
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

            {/* 3. 리스트 피드 (이전 스토리 & 네이티브 광고) - 에피소드 있을 때만 표시 */}
            {hasEpisodes && (
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
            )}

            {/* 구독 후 추가 정보 입력 팝업 */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 구독 완료!</h3>
                            <p className="text-gray-600 text-sm">
                                더욱 정확한 남녀 심리 분석 커스텀 콘텐츠를 위해,<br />본인 정보와 관심사를 알려주시겠어요? (선택)
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">본인 성별</label>
                                <Select value={selectedMyGender} onValueChange={setSelectedMyGender}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="female">여성</SelectItem>
                                        <SelectItem value="male">남성</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연령대</label>
                                <Select value={selectedAge} onValueChange={setSelectedAge}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10s">10대</SelectItem>
                                        <SelectItem value="20s">20대</SelectItem>
                                        <SelectItem value="30s">30대</SelectItem>
                                        <SelectItem value="40s">40대</SelectItem>
                                        <SelectItem value="50s+">50대 이상</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">내 MBTI</label>
                                <Select value={selectedMbti} onValueChange={setSelectedMbti}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'].map(mbti => (
                                            <SelectItem key={mbti} value={mbti}>{mbti}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">관심있는 MBTI</label>
                                <Select value={selectedInterestedMbti} onValueChange={setSelectedInterestedMbti}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'].map(mbti => (
                                            <SelectItem key={mbti} value={mbti}>{mbti}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPopup(false);
                                    setSubscribeMessage('구독이 완료되었습니다! 🎉');
                                    setTimeout(() => setSubscribeMessage(''), 5000);
                                }}
                                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                건너뛰기
                            </button>
                            <button
                                onClick={handleExtraInfoSubmit}
                                disabled={isUpdating}
                                className="flex-1 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-500 transition disabled:opacity-50"
                            >
                                {isUpdating ? '저장 중...' : '저장하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
