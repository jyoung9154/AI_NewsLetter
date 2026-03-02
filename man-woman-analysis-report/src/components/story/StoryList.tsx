'use client';

import { DbEpisode } from '@/types';
import Link from 'next/link';

interface StoryListProps {
    episodes: DbEpisode[];
}

export function StoryList({ episodes }: StoryListProps) {
    return (
        <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
            {/* 헤더 섹션 */}
            <div className="relative mb-16 text-center py-12 px-6 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-white to-blue-50 -z-10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-blue-400"></div>

                <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 tracking-tight">전체 에피소드</h2>
                <p className="text-body-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    화성 남자와 금성 여자의 서로 다른 속마음,<br />
                    지금까지 발행된 모든 분석 보고서를 한눈에 확인해보세요.
                </p>
            </div>

            {/* 에피소드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {episodes.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <span className="text-4xl block mb-4">📭</span>
                        아직 발행된 에피소드가 없습니다.
                    </div>
                ) : (
                    episodes.map((episode, index) => {
                        const episodeNum = episode.episode_number || (episodes.length - index);
                        return (
                            <Link
                                href={`/episodes/${episode.id}`}
                                key={episode.id}
                                className="group cursor-pointer bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-gray-900 text-white rounded-full">
                                        Ep. {String(episodeNum).padStart(2, '0')}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-bold text-gray-400">
                                            {episode.published_at ? new Date(episode.published_at).toLocaleDateString() : ''}
                                        </span>
                                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                            👁️ {episode.view_count || 0}
                                        </span>
                                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                            🔗 {episode.share_count || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* 썸네일 영역 (이미지가 있거나 데스크톱일 때만 표시) */}
                                <div className={`w-full aspect-video bg-gray-50 rounded-xl overflow-hidden mb-4 border border-gray-100 ${!episode.image_url ? 'hidden sm:flex' : 'flex'}`}>
                                    {episode.image_url ? (
                                        <img src={episode.image_url} alt={episode.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-pink-50/30 to-blue-50/30 flex items-center justify-center text-gray-200 text-4xl">
                                            📖
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl md:text-2xl font-serif text-gray-900 mb-3 group-hover:text-pink-600 transition-colors leading-snug">
                                    {episode.title}
                                </h3>

                                <p className="text-body-sm text-gray-500 line-clamp-3 mb-6 flex-grow leading-relaxed">
                                    {episode.situation}
                                </p>

                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-[10px]" title="여성 시점 포함">👩</div>
                                        <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px]" title="남성 시점 포함">👨</div>
                                    </div>
                                    <span className="text-[12px] font-bold text-pink-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                        자세히 보기 <span className="text-sm">→</span>
                                    </span>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            <div className="mt-20 text-center">
                <div className="inline-block p-8 bg-gray-50 rounded-2xl border border-gray-100 max-w-lg">
                    <p className="text-gray-600 text-body mb-4">새로운 에피소드는 매일 아침 업데이트됩니다.</p>
                    <button
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setTimeout(() => {
                                document.getElementById('subscribe-section')?.scrollIntoView({ behavior: 'smooth' });
                            }, 500);
                        }}
                        className="text-pink-600 font-bold underline underline-offset-4 hover:text-pink-500 transition-colors"
                    >
                        구독하고 놓치지 마세요
                    </button>
                </div>
            </div>
        </div>
    );
}
