'use client';

import { useState } from 'react';
import { DbEpisode } from '@/types';
import { InFeedAd, DynamicCoupangAd } from '@/components/ads/Ads';
import { Eye, Share2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from "@/components/ui/Badge";
import { formatTitle } from "@/lib/utils";
import { SubscriptionPopup } from '@/components/subscription/SubscriptionPopup';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';

interface HomeFeedProps {
    episodes: DbEpisode[];
}

export function HomeFeed({ episodes }: HomeFeedProps) {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscribeMessage, setSubscribeMessage] = useState('');

    // 팝업 관련 상태
    const [showPopup, setShowPopup] = useState(false);
    const [subscribedEmail, setSubscribedEmail] = useState('');

    const handleSubscribe = async () => {
        let subEmail = email;
        if (user?.email) subEmail = user.email;

        console.log('[HomeFeed] handleSubscribe called with e-mail:', subEmail);
        if (!subEmail) {
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
                body: JSON.stringify({ email: subEmail, interested_gender: 'both' }) // 간편 구독은 기본값
            });
            const data = await res.json();
            console.log('[HomeFeed] API response status:', res.status, 'data:', data);

            if (res.ok) {
                console.log('[HomeFeed] Subscription successful. Opening popup.');
                setSubscribedEmail(subEmail);
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

    const handlePopupClose = () => {
        setShowPopup(false);
        setSubscribeMessage('구독 되었습니다! 🎉');
        setTimeout(() => setSubscribeMessage(''), 5000);
    };

    const handlePopupSuccess = (msg: string) => {
        setSubscribeMessage(msg);
        setTimeout(() => setSubscribeMessage(''), 5000);
    };

    // episodes가 있을 때만 Hero/List 섹션 표시
    const hasEpisodes = Array.isArray(episodes) && episodes.length > 0;
    const latestEpisode = hasEpisodes ? episodes[0] : null;
    const previousEpisodes = hasEpisodes ? episodes.slice(1, 11) : [];

    // 깨진 이미지 처리를 위한 로컬 상태
    const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

    const handleImageError = (id: string | number) => {
        setBrokenImages(prev => ({ ...prev, [String(id)]: true }));
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">

            {/* 1. 메인 매거진 커버 (Hero Post) - 에피소드 있을 때만 표시 */}
            {hasEpisodes && latestEpisode && (
                <Link
                    href={`/episodes/${latestEpisode.slug}`}
                    className="group cursor-pointer block relative w-full h-[280px] md:h-[350px] rounded-3xl overflow-hidden mb-12 shadow-md border border-gray-100"
                >
                    {/* 임시 커버 이미지 처리 */}
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {latestEpisode.image_url && !brokenImages[`hero-${latestEpisode.id}`] ? (
                            <Image
                                src={latestEpisode.image_url}
                                alt={latestEpisode.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={() => handleImageError(`hero-${latestEpisode.id}`)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-rose-300 via-pink-400 to-fuchsia-400 flex items-center justify-center">
                                <span className="text-8xl opacity-10">💬</span>
                            </div>
                        )}
                    </div>

                    {/* 그라데이션 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* 콘텐츠 정보 */}
                    <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                        <div className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-[10px] md:text-body-sm font-bold uppercase tracking-wider inline-block mb-3">
                            이번 주 최신 이야기
                        </div>
                        <h2 className="text-title md:text-hero font-serif text-white mb-3 leading-tight whitespace-pre-line group-hover:underline decoration-2 underline-offset-4 decoration-pink-400">
                            {formatTitle(latestEpisode.title.replace(/^Episode\s*\d+\.?\s*/i, '').trim())}
                        </h2>
                        <p className="text-gray-200 text-body-sm md:text-body line-clamp-2 max-w-2xl font-medium leading-relaxed">
                            {latestEpisode.situation}
                        </p>
                    </div>
                </Link>
            )}

            {/* 2. 어피티 스타일 - 구독 유도 중간 배너 (2분할 프리미엄 레이아웃) */}
            <div id="subscribe-section" className="my-14 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-blue-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

                <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                    {/* 장식용 배경 요소 */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/3"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-stretch">
                        {/* 왼쪽: 가치 제안 섹션 */}
                        <div className="lg:w-3/5 p-8 md:p-10 lg:p-12 text-left border-b lg:border-b-0 lg:border-r border-white/10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                                Newsletter
                            </div>
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight leading-tight whitespace-nowrap">
                                화성 남자와 금성 여자의 번역기
                            </h3>
                            <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                                이해하기 어려운 속마음, 우리가 번역해 드립니다.<br className="hidden md:block" />
                                <span className="text-white font-medium">매일 아침 8시, 여러분의 메일함으로 찾아갈게요.</span>
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                        <span className="text-lg">✨</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm mb-1">매일 업데이트되는 새로운 에피소드</h4>
                                        <p className="text-gray-500 text-xs leading-relaxed">복잡한 관계의 실마리를 풀어주는 남녀 심리 분석</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                        <span className="text-lg">💌</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm mb-1">아침을 깨우는 5분 심리학 리포트</h4>
                                        <p className="text-gray-500 text-xs leading-relaxed">출근길 대중교통에서 가볍게 읽는 관계 인사이트</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                        <span className="text-lg">🔥</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm mb-1">1만명+ 구독자가 증명하는 가치</h4>
                                        <p className="text-gray-500 text-xs leading-relaxed">이미 수많은 분들이 관계의 해답을 찾고 있습니다</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: 구독 폼 섹션 */}
                        <div className="lg:w-2/5 p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-white/5 backdrop-blur-sm">
                            <div className="mb-6 text-center lg:text-left">
                                <h4 className="text-xl font-bold text-white mb-2">무료로 시작하기</h4>
                                <p className="text-gray-400 text-[13px] sm:text-sm whitespace-nowrap">지금 구독하고 첫 분석 보고서를 즉시 받으세요.</p>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubscribe();
                                }}
                                className="space-y-3"
                            >
                                <div className="relative group">
                                    {!user?.email && (
                                        <input
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="이메일 주소를 입력해주세요"
                                            required
                                            className="w-full px-5 py-4 rounded-xl text-white bg-gray-800 border border-white/10 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500"
                                        />
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubscribing}
                                    className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                                >
                                    {isSubscribing ? '처리 중...' : '뉴스레터 무료 구독'}
                                </button>
                            </form>

                            {subscribeMessage && (
                                <p className={`mt-4 text-center text-sm font-bold ${subscribeMessage.includes('실패') || subscribeMessage.includes('오류') ? 'text-red-400' : 'text-green-400'}`}>
                                    {subscribeMessage}
                                </p>
                            )}

                            <p className="mt-6 text-[10px] text-center text-gray-500 leading-relaxed uppercase tracking-tighter">
                                No spam. Unsubscribe anytime with one click.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. 쿠팡 다이나믹 배너 (고객 관심 기반 추천) */}
            <DynamicCoupangAd />

            {/* 4. 리스트 피드 (이전 스토리 & 네이티브 광고) - 에피소드 있을 때만 표시 */}
            {hasEpisodes && (
                <div className="mt-16">
                    <h3 className="text-section font-serif text-gray-900 mb-8 border-b-2 border-gray-900 pb-4 inline-block">지난 이야기 모아보기</h3>

                    <div className="space-y-10">
                        {previousEpisodes.map((episode) => (
                            <Link
                                href={`/episodes/${episode.slug}`}
                                key={episode.id}
                                className="group cursor-pointer flex flex-col sm:flex-row gap-6 items-start hover:bg-gray-50 p-4 -mx-4 rounded-2xl transition-colors"
                            >
                                {/* 썸네일 박스 (이미지가 있거나 데스크톱일 때만 표시) */}
                                {(episode.image_url || true) && (
                                    <div className={`w-full sm:w-48 aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 ${!episode.image_url || brokenImages[episode.id] ? 'hidden sm:flex' : 'flex'}`}>
                                        {episode.image_url && !brokenImages[episode.id] ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={episode.image_url}
                                                    alt={episode.title}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, 192px"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={() => handleImageError(episode.id)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-pink-50 to-white flex items-center justify-center text-gray-300 text-hero md:text-[3rem]">
                                                📖
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 리스트 텍스트 */}
                                <div className="flex-1 pr-4">
                                    <span className="text-body-sm font-bold text-gray-400 uppercase tracking-widest block mb-2">
                                        스토리로그 {episode.episode_number ? `Episode.${episode.episode_number}` : ''}
                                    </span>
                                    {/* 제목 */}
                                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2 leading-tight whitespace-pre-line">
                                        {formatTitle(episode.title.replace(/^Episode\s*\d+\.?\s*/i, '').trim())}
                                    </h3>
                                    <p className="text-gray-600 text-body line-clamp-2 md:line-clamp-3 leading-relaxed">
                                        {episode.situation}
                                    </p>
                                    <div className="mt-4 flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* 시점 태그: tags 배열에서 동적으로 렌더 */}
                                            {episode.tags?.includes('여자의 시점') && (
                                                <div className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">🙋‍♀️ 여자의 시점</div>
                                            )}
                                            {episode.tags?.includes('남자의 시점') && (
                                                <div className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">🙍‍♂️ 남자의 시점</div>
                                            )}
                                            {/* 기존 에피소드 (tags에 시점 태그 없는 경우) fallback */}
                                            {!episode.tags?.includes('여자의 시점') && !episode.tags?.includes('남자의 시점') && (
                                                <>
                                                    <div className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">🙋‍♀️ 여자의 시점</div>
                                                    <div className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">🙍‍♂️ 남자의 시점</div>
                                                </>
                                            )}
                                            {episode.dialogue && (
                                                <div className="text-[11px] font-bold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">💬 대화 재현</div>
                                            )}
                                            {episode.expert_analysis && (
                                                <div className="text-[11px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">🕵️ 심리 분석</div>
                                            )}
                                            {episode.probability_stats && (
                                                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">📊 확률 통계</div>
                                            )}
                                            {episode.worst_response && (
                                                <div className="text-[11px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">⚠️ 최악의 응수</div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 ml-auto no-capture">
                                            <div className="flex items-center gap-2.5 text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span className="text-[11px] font-medium">{(episode.view_count || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Share2 className="w-3.5 h-3.5" />
                                                    <span className="text-[11px] font-medium">{(episode.share_count || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 border-l border-gray-200 pl-4 h-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const url = `${window.location.origin}/episodes/${episode.slug}`;
                                                        if (window.Kakao) {
                                                            window.Kakao.Share.sendDefault({
                                                                objectType: 'feed',
                                                                content: {
                                                                    title: `[남녀분석보고서] ${episode.title}`,
                                                                    description: episode.situation.substring(0, 100) + '...',
                                                                    imageUrl: episode.image_url || `${window.location.origin}/og-image.jpg`,
                                                                    link: { mobileWebUrl: url, webUrl: url },
                                                                },
                                                                buttons: [{ title: '스토리 보기', link: { mobileWebUrl: url, webUrl: url } }],
                                                            });
                                                        }
                                                    }}
                                                    className="w-7 h-7 bg-[#FEE500] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                                                    title="카카오톡 공유"
                                                >
                                                    <span className="text-[8px] font-bold text-[#3C1E1E]">Talk</span>
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const url = `${window.location.origin}/episodes/${episode.slug}`;
                                                        await navigator.clipboard.writeText(url);
                                                        alert('스토리 링크가 복사되었습니다. 인스타그램 스토리에 링크를 붙여넣어 공유해보세요!');
                                                        window.open('instagram://story-camera', '_blank');
                                                    }}
                                                    className="w-7 h-7 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                                                    title="인스타그램 공유"
                                                >
                                                    <Share2 className="w-3.5 h-3.5 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* 리스트 끝부분에 In-Feed 광고 배치 - 에피소드 키워드 기반 */}
                        <div className="pt-8 border-t border-gray-100 mt-8">
                            <InFeedAd
                                keyword={
                                    latestEpisode?.coupang_keyword ||
                                    latestEpisode?.tags?.[0] ||
                                    '데이트'
                                }
                                category="데이트 선물"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 구독 후 추가 정보 입력 팝업 */}
            {showPopup && (
                <SubscriptionPopup
                    email={subscribedEmail}
                    onClose={handlePopupClose}
                    onSuccess={handlePopupSuccess}
                />
            )}
        </div>
    );
}
