import { useState, useMemo } from 'react';
import { DbEpisode } from '@/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { formatTitle } from '@/lib/utils';
import { MessageSquare, Eye, Share2, Clock, ChevronRight, Search, X, Heart } from 'lucide-react';

interface StoryListProps {
    episodes: DbEpisode[];
}

export function StoryList({ episodes }: StoryListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    // 깨진 이미지 처리를 위한 로컬 상태
    const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

    const handleImageError = (id: string | number) => {
        setBrokenImages((prev: Record<string, boolean>) => ({ ...prev, [String(id)]: true }));
    };

    // 유틸리티: 문자열 정규화 (소문자화 + 모든 공백 제거)
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');

    // 검색 및 유사도 정렬 로직 (Fuzzy Matching 강화)
    const filteredAndSortedEpisodes = useMemo(() => {
        const trimmedQuery = searchTerm.trim().toLowerCase();
        if (!trimmedQuery) return episodes;

        const queryKeywords = trimmedQuery.split(/\s+/).filter(k => k.length > 0);
        const normalizedQuery = normalize(trimmedQuery);

        return episodes
            .map(episode => {
                let score = 0;

                // 원본 필드
                const title = episode.title.toLowerCase();
                const situation = episode.situation.toLowerCase();
                const tagsStr = (episode.tags || []).join(' ').toLowerCase();

                // 정규화 필드 (공백 제거 버전)
                const nTitle = normalize(episode.title);
                const nSituation = normalize(episode.situation);
                const nTags = normalize((episode.tags || []).join(''));

                // 1. 전체 문구 일치 및 정규화 일치 (최고 가중치)
                if (title.includes(trimmedQuery)) score += 100;
                else if (nTitle.includes(normalizedQuery)) score += 80;

                if (situation.includes(trimmedQuery)) score += 40;
                else if (nSituation.includes(normalizedQuery)) score += 30;

                // 2. 키워드별 개별 매칭 (부분 일치 대응)
                let matchedKeywordsCount = 0;
                queryKeywords.forEach(keyword => {
                    let keywordScore = 0;
                    const nKeyword = normalize(keyword);

                    // 제목 매칭
                    if (title.includes(keyword)) {
                        keywordScore += 20;
                        if (title.startsWith(keyword)) keywordScore += 10; // 시작 단어 가산점
                    } else if (nTitle.includes(nKeyword)) {
                        keywordScore += 15;
                    }

                    // 상황 매칭
                    if (situation.includes(keyword)) {
                        keywordScore += 10;
                    } else if (nSituation.includes(nKeyword)) {
                        keywordScore += 7;
                    }

                    // 태그 매칭
                    if (tagsStr.includes(keyword)) {
                        keywordScore += 12;
                    } else if (nTags.includes(nKeyword)) {
                        keywordScore += 8;
                    }

                    if (keywordScore > 0) {
                        score += keywordScore;
                        matchedKeywordsCount++;
                    }
                });

                // 3. 키워드 보너스 (여러 키워드를 입력했을 때 많이 포함할수록 가산점)
                if (queryKeywords.length > 1 && matchedKeywordsCount > 0) {
                    score += (matchedKeywordsCount / queryKeywords.length) * 50;
                }

                return { ...episode, score };
            })
            .filter(episode => episode.score > 0)
            .sort((a, b) => b.score - a.score);
    }, [episodes, searchTerm]);

    return (
        <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
            {/* 헤더 섹션 */}
            <div className="relative mb-8 text-center py-12 px-6 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-white to-blue-50/50 -z-10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400"></div>

                <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-4 tracking-tight">전체 에피소드</h2>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
                    화성 남자와 금성 여자의 서로 다른 속마음,<br />
                    지금까지 발행된 모든 분석 보고서를 한눈에 확인해보세요.
                </p>

                {/* 검색 바 */}
                <div className="mt-8 max-w-xl mx-auto relative group">
                    <div className="absolute inset-0 bg-pink-400/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="상황이나 키워드로 에피소드를 검색해보세요..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-sm md:text-base"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 에피소드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredAndSortedEpisodes.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center">
                        <div className="text-5xl mb-6 grayscale transform transition-transform hover:scale-110 duration-500">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">검색 결과가 없습니다</h3>
                        <p className="text-gray-500">다른 키워드로 검색해보시겠어요?</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-6 text-pink-600 font-bold border-b-2 border-pink-600 pb-1 hover:text-pink-500 hover:border-pink-500 transition-all"
                        >
                            전체 목록 보기
                        </button>
                    </div>
                ) : (
                    filteredAndSortedEpisodes.map((episode, index) => {
                        const episodeNum = episode.episode_number || (episodes.length - index);
                        return (
                            <Link
                                href={`/episodes/${episode.slug}`}
                                key={episode.id}
                                className="group cursor-pointer bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:border-pink-200 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
                            >
                                {/* 호버 효과 가이드 라인 */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-gray-900 text-white rounded-lg">
                                            Ep. {String(episodeNum).padStart(2, '0')}
                                        </span>
                                        {searchTerm && (
                                            <span className="text-[10px] bg-pink-100 text-pink-600 font-bold px-2 py-1 rounded-lg">연관 에피소드</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-bold text-gray-300">
                                            {episode.published_at ? new Date(episode.published_at).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* 썸네일 영역 */}
                                <div className={`w-full aspect-[16/10] bg-gray-50 rounded-2xl overflow-hidden mb-6 border border-gray-100 relative ${!episode.image_url || brokenImages[episode.id] ? 'hidden sm:flex' : 'flex'}`}>
                                    {episode.image_url && !brokenImages[episode.id] ? (
                                        <>
                                            <img
                                                src={episode.image_url}
                                                alt={episode.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={() => handleImageError(episode.id)}
                                            />
                                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center text-5xl">
                                            📖
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg md:text-xl font-serif font-bold text-gray-900 group-hover:text-pink-600 transition-colors mb-3 line-clamp-2 whitespace-pre-line">
                                    {formatTitle(episode.title.replace(/^Episode\s*\d+\.?\s*/i, '').trim())}
                                </h3>

                                <p className="text-gray-500 line-clamp-3 mb-8 flex-grow leading-relaxed text-[15px]">
                                    {episode.situation}
                                </p>

                                <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-wrap items-center gap-3 flex-1">
                                        <div className="flex gap-2">
                                            <div className="px-3 py-1 rounded-full bg-pink-50 text-[10px] font-bold text-pink-600 flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" /> 여자의 시점
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                                <Heart className="w-2.5 h-2.5" /> 남자의 시점
                                            </div>
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
                                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors translate-x-0 group-hover:translate-x-1 duration-300 ml-4">
                                        <Search className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            <div className="mt-20 text-center">
                <div className="inline-block p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm max-w-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-50/20 to-transparent -z-10 group-hover:scale-110 transition-transform duration-700"></div>
                    <p className="text-gray-600 font-medium mb-6">새로운 에피소드는 매일 아침 업데이트됩니다.</p>
                    <button
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setTimeout(() => {
                                document.getElementById('subscribe-section')?.scrollIntoView({ behavior: 'smooth' });
                            }, 500);
                        }}
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 hover:shadow-lg transition-all active:scale-95"
                    >
                        구독하고 놓치지 마세요 💌
                    </button>
                </div>
            </div>
        </div >
    );
}
// trigger build
