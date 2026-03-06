'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Sparkles, RefreshCw, Share2, Heart, Coffee, Info } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

interface TarotCard {
    id: string;
    card_number: number;
    name_ko: string;
    name_en: string;
    meaning_past: string;
    meaning_present: string;
    meaning_future: string;
}

export function TarotCardPicker() {
    const [step, setStep] = useState<'intro' | 'picking' | 'result' | 'loading'>('loading');
    const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
    const [generalMessage, setGeneralMessage] = useState<string>('');
    const [allCards, setAllCards] = useState<number[]>(Array.from({ length: 22 }, (_, i) => i));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createSupabaseBrowser();

    // 초기 로드 시 오늘 뽑은 결과가 있는지 확인
    useEffect(() => {
        const checkTodayResult = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    setStep('intro');
                    return;
                }

                // 오늘 날짜의 시작과 끝 계산 (KST 기준 처리가 필요할 수 있으나 단순하게 UTC 오늘로 처리)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const { data, error: fetchError } = await supabase
                    .from('tarot_history')
                    .select(`
                        *,
                        card1:tarot_cards!card1_id(*),
                        card2:tarot_cards!card2_id(*),
                        card3:tarot_cards!card3_id(*),
                        msg:tarot_general_messages!message_id(*)
                    `)
                    .eq('user_id', session.user.id)
                    .gte('created_at', today.toISOString())
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    setSelectedCards([data.card1, data.card2, data.card3]);

                    let finalMsg = data.msg.content;
                    finalMsg = finalMsg
                        .replace(/\{0\}/g, data.card1.name_ko)
                        .replace(/\{1\}/g, data.card2.name_ko)
                        .replace(/\{2\}/g, data.card3.name_ko);

                    setGeneralMessage(finalMsg);
                    setStep('result');
                } else {
                    setStep('intro');
                }
            } catch (err) {
                console.error('Error checking today result:', err);
                setStep('intro');
            }
        };

        checkTodayResult();
    }, []);

    // 카드 셔플 (순서 뒤섞기)
    useEffect(() => {
        if (step === 'picking') {
            setAllCards((prev) => [...prev].sort(() => Math.random() - 0.5));
        }
    }, [step]);

    const handlePick = async (cardNumber: number) => {
        if (selectedCards.length >= 3 || loading) return;

        setLoading(true);
        try {
            const supabase = createSupabaseBrowser();
            const { data, error: fetchError } = await supabase
                .from('tarot_cards')
                .select('*')
                .eq('card_number', cardNumber)
                .single();

            if (fetchError) throw fetchError;

            const newSelected = [...selectedCards, data];
            setSelectedCards(newSelected);

            if (newSelected.length === 3) {
                // 종합 운명 메시지 가져오기
                const { data: msgData, error: msgError } = await supabase
                    .from('tarot_general_messages')
                    .select('id, content');

                if (msgError) {
                    console.error('Error fetching general message:', msgError);
                } else if (msgData && msgData.length > 0) {
                    const randomIdx = Math.floor(Math.random() * msgData.length);
                    const selectedMsgObj = msgData[randomIdx];
                    let randomMsg = selectedMsgObj.content;

                    // 플레이스홀더 치환 로직: {0}=과거, {1}=현재, {2}=미래
                    if (newSelected.length === 3) {
                        randomMsg = randomMsg
                            .replace(/\{0\}/g, newSelected[0].name_ko)
                            .replace(/\{1\}/g, newSelected[1].name_ko)
                            .replace(/\{2\}/g, newSelected[2].name_ko);
                    }

                    setGeneralMessage(randomMsg);

                    // DB에 결과 저장
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('tarot_history').insert({
                            user_id: session.user.id,
                            card1_id: newSelected[0].id,
                            card2_id: newSelected[1].id,
                            card3_id: newSelected[2].id,
                            message_id: selectedMsgObj.id
                        });
                    }
                }

                setTimeout(() => setStep('result'), 600);
            }
        } catch (err: any) {
            console.error('Error picking card:', err);
            setError('카드를 가져오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('intro');
        setSelectedCards([]);
        setGeneralMessage('');
        setError(null);
    };

    if (step === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-500 animate-pulse">오늘의 운세를 불러오는 중...</p>
            </div>
        );
    }

    if (step === 'intro') {
        return (
            <div className="text-center py-10">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner animate-pulse">
                    🔮
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">오늘의 연애 타로 (3장 뽑기)</h3>
                <div className="inline-block px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100 mb-4 uppercase tracking-tighter">
                    Limited: 1 per day
                </div>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed text-sm">
                    마음을 가다듬고 당신의 연애 흐름을 확인해보세요.<br />
                    <strong>과거, 현재, 미래</strong>를 상징하는 3장의 카드가 당신의 운명을 들려줍니다.
                </p>
                <Button
                    onClick={() => setStep('picking')}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-12 py-7 text-lg font-bold shadow-lg transition-transform hover:scale-105"
                >
                    카드 뽑기 시작
                </Button>
            </div>
        );
    }

    if (step === 'picking') {
        return (
            <div className="text-center py-6">
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedCards.length === 0 && "첫 번째 카드(과거)를 선택하세요"}
                        {selectedCards.length === 1 && "두 번째 카드(현재)를 선택하세요"}
                        {selectedCards.length === 2 && "마지막 카드(미래)를 선택하세요"}
                    </h3>
                    <div className="flex justify-center gap-3">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-colors duration-300 ${selectedCards.length > i ? 'bg-purple-600' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-w-2xl mx-auto mb-12 px-4">
                    {allCards.map((num) => {
                        const isPicked = selectedCards.some(c => c.card_number === num);
                        return (
                            <div
                                key={num}
                                onClick={() => !isPicked && handlePick(num)}
                                className={`aspect-[2/3] bg-gradient-to-br from-purple-900 to-indigo-950 rounded-lg border-2 border-white/20 shadow-md cursor-pointer transition-all duration-300 relative overflow-hidden group ${isPicked ? 'opacity-20 grayscale scale-95 pointer-events-none' : 'hover:-translate-y-2 hover:shadow-purple-200 hover:border-purple-400'
                                    }`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                                    <Sparkles className="text-white w-6 h-6" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {loading && (
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
                        <p className="text-purple-600 text-sm font-medium">운명을 읽는 중...</p>
                    </div>
                )}
                {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
            </div>
        );
    }

    return (
        <div className="py-6 max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-gray-900 font-serif mb-2">당신의 연애 타로 리포트</h3>
                <p className="text-gray-500">세 장의 카드가 보여주는 당신의 연애 흐름입니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {selectedCards.map((card, idx) => {
                    const titles = ['과거 / 원인', '현재 / 상황', '미래 / 조언'];
                    const meanings = [card.meaning_past, card.meaning_present, card.meaning_future];
                    const colors = ['bg-blue-50 border-blue-100 text-blue-700', 'bg-purple-50 border-purple-100 text-purple-700', 'bg-pink-50 border-pink-100 text-pink-700'];

                    return (
                        <Card key={idx} className="overflow-hidden border-2 border-gray-50 hover:border-purple-100 transition-colors shadow-sm">
                            <div className={`p-3 text-center text-xs font-bold uppercase tracking-widest ${colors[idx]}`}>
                                {titles[idx]}
                            </div>
                            <div className="p-6 text-center border-b border-gray-50 bg-gray-50/30">
                                <div className="w-24 h-40 bg-white rounded-lg mx-auto mb-4 border-2 border-gray-100 shadow-inner flex items-center justify-center overflow-hidden">
                                    <span className="text-4xl">🃏</span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">{card.name_ko}</h4>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">{card.name_en}</p>
                            </div>
                            <CardContent className="p-6">
                                <p className="text-gray-700 text-sm leading-relaxed text-center">
                                    {meanings[idx]}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-purple-400">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <h4 className="font-bold text-xl">종합적인 운명의 메시지</h4>
                    </div>
                    <p className="text-gray-200 leading-relaxed text-lg mb-8 font-light italic">
                        {generalMessage || `당신의 인연은 과거의 ${selectedCards[0]?.name_ko} 에너지로부터 시작되어, 현재 ${selectedCards[1]?.name_ko}의 중대한 전환점을 지나고 있습니다. 미래에는 ${selectedCards[2]?.name_ko}의 기운이 당신의 연애사에 결정적인 역할을 할 것입니다.`}
                    </p>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-8">
                        <p className="text-sm text-gray-400 leading-relaxed">
                            * 이 결과는 22장의 메이저 아르카나가 가진 인생의 큰 흐름과 당신의 에너지가 만난 순간의 기록입니다.
                            중요한 선택의 순간에 이 메시지를 다시 한번 떠올려보세요.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={reset}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 rounded-full px-8"
                        >
                            다시 확인하기
                        </Button>
                        <Button
                            className="bg-pink-600 hover:bg-pink-500 text-white rounded-full px-10 flex-1 flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Share2 className="w-4 h-4" /> 결과 공유하고 운세 저장하기
                        </Button>
                    </div>
                </div>
                {/* 장식 배경 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
            </div>
        </div>
    );
}
