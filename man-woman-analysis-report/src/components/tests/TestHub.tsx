'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sparkles, Heart, Zap, Coffee, Share2 } from 'lucide-react';

interface TestItem {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    tag: string;
    status: 'active' | 'preparing';
    color: string;
}

const tests: TestItem[] = [
    {
        id: 'tarot',
        title: '오늘의 연애 타로',
        description: '오늘 당신의 연애운은 어떨까요? 카드를 뽑아 확인해보세요.',
        icon: <Sparkles className="w-6 h-6" />,
        tag: 'Daily',
        status: 'active',
        color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
        id: 'mbti-love',
        title: '연애로 보는 내 MBTI',
        description: '연애할 때 나의 진짜 모습은? 상황별 질문으로 알아보는 MBTI.',
        icon: <Heart className="w-6 h-6" />,
        tag: 'New',
        status: 'preparing',
        color: 'bg-pink-50 text-pink-600 border-pink-100',
    },
    {
        id: 'attachment',
        title: '나의 연애 애착 유형',
        description: '내 애착 유형은 안정형? 불안형? 회피형? 심층 분석해드립니다.',
        icon: <Zap className="w-6 h-6" />,
        tag: 'Focus',
        status: 'preparing',
        color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
        id: 'compatibility',
        title: 'MBTI 궁합 분석기',
        description: '그 사람과 나의 MBTI는 얼마나 잘 맞을까요?',
        icon: <Coffee className="w-6 h-6" />,
        tag: 'Popular',
        status: 'active',
        color: 'bg-orange-50 text-orange-600 border-orange-100',
    }
];

interface TestHubProps {
    onSelectTest: (id: string) => void;
}

export function TestHub({ onSelectTest }: TestHubProps) {
    return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 font-serif mb-3">심리테스트 & 미니 앱</h2>
                <p className="text-gray-500 text-lg">
                    당신의 연애를 더 깊이 있게 이해하기 위한 인터랙티브 콘텐츠를 준비했습니다.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tests.map((test) => (
                    <div
                        key={test.id}
                        className={`group relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 ${test.status === 'active'
                                ? 'border-transparent shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                                : 'border-gray-50 opacity-80'
                            }`}
                        onClick={() => test.status === 'active' && onSelectTest(test.id)}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${test.color} border shadow-inner`}>
                                {test.icon}
                            </div>
                            <Badge variant="secondary" className={`${test.color} border px-3 py-1 text-[10px] font-bold uppercase tracking-wider`}>
                                {test.tag}
                            </Badge>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                            {test.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            {test.description}
                        </p>

                        <div className="flex items-center justify-between">
                            {test.status === 'active' ? (
                                <span className="text-pink-600 font-bold text-sm flex items-center">
                                    시작하기 <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            ) : (
                                <span className="text-gray-400 font-medium text-sm italic">준비 중입니다...</span>
                            )}

                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Share2 className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* 카드 배경 장식 */}
                        <div className={`absolute -bottom-2 -right-2 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${test.color}`}></div>
                    </div>
                ))}
            </div>

            {/* 안내 문구 */}
            <div className="mt-16 p-8 rounded-3xl bg-pink-50 border border-pink-100 text-center">
                <h4 className="text-pink-900 font-bold mb-2">남녀 언어 영역 모의고사, 연애 운세 등 추가 오픈 예정!</h4>
                <p className="text-pink-700 text-sm opacity-80">원하시는 테스트가 있다면 고객 의견함에 남겨주세요.</p>
            </div>
        </div>
    );
}
