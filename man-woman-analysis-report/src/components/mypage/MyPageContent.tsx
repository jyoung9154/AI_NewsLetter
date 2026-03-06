'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Heart, MessageSquare, AlertCircle, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BookmarkedEpisode {
    episode_id: string;
    created_at: string;
    episodes: {
        id: string;
        title: string;
        slug: string;
        episode_number: number;
        image_url: string;
        situation: string;
        view_count: number;
    }
}

export function MyPageContent() {
    const { user, loading } = useAuth();
    const [bookmarks, setBookmarks] = useState<BookmarkedEpisode[]>([]);
    const [recommendedEpisodes, setRecommendedEpisodes] = useState<any[]>([]);
    const [userMbti, setUserMbti] = useState<{ mbti: string; gender: string } | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        // Load MBTI preference from local storage
        try {
            const stored = localStorage.getItem('mbti_preference');
            if (stored) setUserMbti(JSON.parse(stored));
        } catch (e) {
            console.error(e);
        }

        if (!loading && user) {
            fetchBookmarks();
            fetchRecommendations();
        } else if (!loading && !user) {
            setIsFetching(false);
        }
    }, [user, loading]);

    const fetchBookmarks = async () => {
        setIsFetching(true);
        try {
            const res = await fetch('/api/bookmarks');
            if (res.ok) {
                const data = await res.json();
                setBookmarks(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch bookmarks', error);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            // Fetch latest episodes as a simple recommendation fallback for now
            // Later we can filter by MBTI keyword
            const res = await fetch('/api/episodes?limit=4');
            if (res.ok) {
                const data = await res.json();
                setRecommendedEpisodes(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations', error);
        }
    };

    if (loading || isFetching) {
        return (
            <div className="min-h-screen bg-gray-50 py-32 text-center">
                <p className="text-gray-500 animate-pulse">정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
                    <AlertCircle className="w-16 h-16 text-pink-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
                    <p className="text-gray-600 mb-8 whitespace-pre-line">
                        마음에 드는 에피소드를 저장하고 모아보려면{'\n'}소셜 로그인을 진행해주세요.
                    </p>
                    <Link href="/">
                        <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-6 text-lg font-bold shadow-[0_4px_14px_0_rgba(219,39,119,0.39)]">
                            메인으로 돌아가기
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
                {/* 프로필 요약 */}
                <div className="bg-white rounded-3xl p-8 mb-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                    {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-24 h-24 rounded-full border-4 border-pink-50 shadow-sm object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-sm">
                            {(user.user_metadata?.nickname || user.email || 'U')[0].toUpperCase()}
                        </div>
                    )}
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">
                            {user.user_metadata?.nickname || user.user_metadata?.name || user.email?.split('@')[0]}님의 서재
                        </h1>
                        <p className="text-gray-500">
                            총 {bookmarks.length}개의 에피소드를 담아두셨네요.
                        </p>
                    </div>
                </div>

                {/* 북마크 목록 */}
                <div className="space-y-6 mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
                        <Bookmark className="text-pink-600" /> 저장한 에피소드
                    </h2>

                    {bookmarks.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                            <span className="text-4xl opacity-50 mb-4 block">📚</span>
                            <p className="text-gray-500 font-medium">아직 저장한 에피소드가 없습니다.</p>
                            <Link href="/">
                                <span className="text-pink-600 font-bold hover:underline mt-4 inline-block">스토리 보러가기 →</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bookmarks.map((bookmark) => {
                                const ep = bookmark.episodes;
                                return (
                                    <Link key={bookmark.episode_id} href={`/episodes/${ep.slug}`}>
                                        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all group flex flex-col h-full cursor-pointer">
                                            {ep.image_url ? (
                                                <div className="h-48 overflow-hidden relative">
                                                    <Image
                                                        src={ep.image_url}
                                                        alt={ep.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6 text-center">
                                                    <span className="text-pink-500 font-bold opacity-50">Episode {ep.episode_number}</span>
                                                </div>
                                            )}

                                            <div className="p-5 flex flex-col flex-grow">
                                                <span className="text-pink-600 text-xs font-bold tracking-wider mb-2 uppercase">Episode {ep.episode_number}</span>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                                    {ep.title.replace(/^Episode\s*\d+\.?\s*/i, '')}
                                                </h3>
                                                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                                                    {ep.situation}
                                                </p>
                                                <div className="flex items-center text-xs text-gray-400 mt-auto">
                                                    <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {ep.view_count || 0}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>저장일: {new Date(bookmark.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* MBTI 기반 추천 에피소드 섹션 */}
                {userMbti && recommendedEpisodes.length > 0 && (
                    <div className="space-y-6 mb-16 pt-12 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2 mb-2">
                                    <Sparkles className="text-purple-600" /> 맞춤 큐레이션
                                </h2>
                                <p className="text-gray-500">
                                    최근 <b>{userMbti.mbti}</b> 매칭 분석을 하신 기록을 바탕으로 추천해드려요.
                                </p>
                            </div>
                            <Link href="/">
                                <Button variant="outline" className="text-gray-500 hover:text-gray-900 border-gray-200">
                                    전체보기
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {recommendedEpisodes.slice(0, 4).map((ep: any) => (
                                <Link key={ep.id} href={`/episodes/${ep.slug}`}>
                                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group h-full flex flex-col cursor-pointer">
                                        {ep.image_url ? (
                                            <div className="h-32 overflow-hidden relative">
                                                <Image
                                                    src={ep.image_url}
                                                    alt={ep.title}
                                                    fill
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                <span className="text-purple-500 font-bold opacity-50 text-xs">Episode {ep.episode_number}</span>
                                            </div>
                                        )}
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">
                                                {ep.title.replace(/^Episode\s*\d+\.?\s*/i, '')}
                                            </h3>
                                            <div className="flex items-center text-[10px] text-gray-400 mt-auto">
                                                <Eye className="w-3 h-3 mr-1" /> {ep.view_count || 0}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
