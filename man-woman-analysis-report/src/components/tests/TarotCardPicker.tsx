'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Sparkles, RefreshCw, Share2, Heart, Coffee } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

interface TarotCard {
    id: string;
    name_ko: string;
    name_en: string;
    image_url: string;
    content_general: string;
    content_love_single: string;
    content_love_couple: string;
    is_major: boolean;
}

export function TarotCardPicker() {
    const [step, setStep] = useState<'intro' | 'picking' | 'result'>('intro');
    const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pickCard = async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createSupabaseBrowser();

            // Get count first or just select random
            const { data, error: fetchError } = await supabase
                .from('tarot_cards')
                .select('*');

            if (fetchError) throw fetchError;

            if (data && data.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.length);
                setSelectedCard(data[randomIndex]);
                setStep('result');
            } else {
                setError('타로 카드 데이터를 찾을 수 없습니다. DB 설정을 확인해주세요.');
            }
        } catch (err: any) {
            console.error('Error picking tarot card:', err);
            setError('카드를 뽑는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'intro') {
        return (
            <div className="text-center py-10">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                    🔮
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">오늘의 연애 타로</h3>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed">
                    잠시 마음을 가다듬고, 현재 당신의 연애 고민이나 상대방을 떠올려보세요.
                    타로 카드가 당신에게 필요한 조언을 들려줄 거예요.
                </p>
                <Button
                    onClick={() => setStep('picking')}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-12 py-7 text-lg font-bold shadow-lg"
                >
                    카드 뽑기 시작
                </Button>
            </div>
        );
    }

    if (step === 'picking') {
        return (
            <div className="text-center py-10">
                <h3 className="text-xl font-bold text-gray-900 mb-8">가장 마음이 끌리는 카드를 선택하세요</h3>
                <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto mb-12">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            onClick={() => !loading && pickCard()}
                            className={`w-24 h-40 bg-gradient-to-br from-purple-900 to-indigo-950 rounded-xl border-2 border-white/20 shadow-xl cursor-pointer hover:-translate-y-4 hover:rotate-3 transition-all duration-300 relative overflow-hidden group ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {/* 카드 뒷면 문양 */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                                <div className="w-full h-full border-4 border-white/10 m-2 rounded-lg flex items-center justify-center">
                                    <Sparkles className="text-white w-8 h-8" />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>
                {loading && (
                    <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                        <p className="text-purple-600 font-medium">운명의 카드를 찾고 있습니다...</p>
                    </div>
                )}
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        );
    }

    return (
        <div className="py-6 max-w-2xl mx-auto">
            {selectedCard && (
                <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl">
                    <div className="bg-purple-600 p-8 text-center text-white relative">
                        <div className="absolute top-4 left-4 opacity-50"><Sparkles /></div>
                        <div className="absolute bottom-4 right-4 opacity-50"><Sparkles /></div>
                        <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4 inline-block">Today's Tarot</span>
                        <h3 className="text-3xl font-bold mb-2 font-serif">{selectedCard.name_ko} ({selectedCard.name_en})</h3>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10">
                            {/* 카드 이미지 (Placeholder or Real URL) */}
                            <div className="w-48 h-80 bg-gray-100 rounded-2xl flex-shrink-0 flex items-center justify-center border-4 border-purple-50 shadow-inner overflow-hidden relative">
                                {selectedCard.image_url ? (
                                    <img src={selectedCard.image_url} alt={selectedCard.name_ko} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <span className="text-6xl mb-4 block">🃏</span>
                                        <span className="text-xs text-gray-400 font-medium">{selectedCard.name_en}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <h4 className="text-purple-600 font-bold text-sm mb-2 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4" /> 카드의 기본 의미
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl">
                                        {selectedCard.content_general}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-pink-50 border border-pink-100">
                                <h4 className="flex items-center gap-2 text-pink-700 font-bold mb-3">
                                    <Heart className="w-5 h-5" /> 솔로 연애운
                                </h4>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {selectedCard.content_love_single}
                                </p>
                            </div>
                            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100">
                                <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-3">
                                    <Coffee className="w-5 h-5" /> 커플 연애운
                                </h4>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {selectedCard.content_love_couple}
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <Button
                                variant="outline"
                                className="rounded-full px-6 flex items-center gap-2 text-gray-500"
                                onClick={() => {
                                    setStep('picking');
                                    setSelectedCard(null);
                                }}
                            >
                                다시 뽑기
                            </Button>
                            <Button
                                className="bg-gray-900 text-white rounded-full px-8 py-4 flex items-center gap-2 hover:bg-gray-800"
                            >
                                <Share2 className="w-4 h-4" /> 결과 공유하여 운 공유하기
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
