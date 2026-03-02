'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Loader2, Heart, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export function MBTIAnalyzer() {
    const [myMbti, setMyMbti] = useState<string>('');
    const [myGender, setMyGender] = useState<string>('');
    const [targetMbti, setTargetMbti] = useState<string>('');
    const [targetGender, setTargetGender] = useState<string>('');
    const [situation, setSituation] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const mbtiList = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

    const handleAnalyze = async () => {
        if (!myMbti || !myGender || !targetMbti || !targetGender) {
            alert('MBTI와 성별을 모두 선택해주세요!');
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        try {
            const res = await fetch('/api/analyze/mbti', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ myMbti, myGender, targetMbti, targetGender, situation })
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
            } else {
                const error = await res.json();
                alert(error.error || '분석에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                    MBTI <span className="text-pink-600">상황별 궁합</span> 분석기
                </h2>
                <p className="text-gray-600">구체적인 상황을 입력하시면 GLM-4.5-Flash AI가 맞춤형 연애 전략을 세워드립니다.</p>
            </div>

            {/* 입력 섹션 */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* 본인 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
                            <Heart size={18} fill="currentColor" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">본인</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                            <Select value={myGender} onValueChange={setMyGender}>
                                <SelectTrigger className="rounded-xl h-12">
                                    <SelectValue placeholder="성별 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="female">여성</SelectItem>
                                    <SelectItem value="male">남성</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">MBTI</label>
                            <Select value={myMbti} onValueChange={setMyMbti}>
                                <SelectTrigger className="rounded-xl h-12">
                                    <SelectValue placeholder="MBTI 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mbtiList.map(mbti => (
                                        <SelectItem key={mbti} value={mbti}>{mbti}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* 상대 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <Sparkles size={18} fill="currentColor" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">상대방</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                            <Select value={targetGender} onValueChange={setTargetGender}>
                                <SelectTrigger className="rounded-xl h-12">
                                    <SelectValue placeholder="성별 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="female">여성</SelectItem>
                                    <SelectItem value="male">남성</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">MBTI</label>
                            <Select value={targetMbti} onValueChange={setTargetMbti}>
                                <SelectTrigger className="rounded-xl h-12">
                                    <SelectValue placeholder="MBTI 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mbtiList.map(mbti => (
                                        <SelectItem key={mbti} value={mbti}>{mbti}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 상황 입력 섹션 */}
            <div className="mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle size={18} className="text-gray-400" />
                        <h3 className="font-bold text-gray-800">분석하고 싶은 상황 (선택사항)</h3>
                    </div>
                    <textarea
                        value={situation}
                        onChange={(e) => setSituation(e.target.value)}
                        placeholder="예: 연락 문제로 자주 싸워요, 첫 데이트 장소를 정하고 싶어요, 상대방이 갑자기 차가워졌어요 등"
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all resize-none"
                    />
                </div>
            </div>

            {/* 분석 버튼 */}
            <div className="text-center mb-16">
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-12 rounded-full transition-all flex items-center gap-3 mx-auto shadow-lg hover:scale-105 active:scale-95 disabled:opacity-70"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            분석 중...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            AI가 분석하는 궁합 확인하기
                        </>
                    )}
                </button>
            </div>

            {/* 결과 섹션 */}
            {result && (
                <div className="animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="bg-gradient-to-br from-pink-50 to-white p-8 md:p-12 rounded-[2rem] border border-pink-100 shadow-xl overflow-hidden relative">
                        {/* 배경 데코 */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                        <div className="relative z-10 text-center mb-12">
                            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-xs font-bold mb-4">
                                {result.compatibility_tag}
                            </span>
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <span className="text-5xl font-black text-gray-900">{result.score}</span>
                                <span className="text-2xl font-bold text-gray-400">/ 100</span>
                            </div>
                            <h4 className="text-2xl font-bold text-gray-800 leading-tight">
                                "{result.summary}"
                            </h4>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-bold text-gray-900">
                                    <Heart size={18} className="text-pink-500" /> 끌리는 이유
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {result.attraction}
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-bold text-gray-900">
                                    <AlertCircle size={18} className="text-amber-500" /> 갈등 가능성
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {result.challenges}
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-bold text-gray-900">
                                    <CheckCircle2 size={18} className="text-green-500" /> 서로를 위한 팁
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {result.tips}
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 text-center pt-8 border-t border-pink-100">
                            <p className="text-gray-500 text-xs">
                                *이 결과는 보편적인 MBTI 성향을 바탕으로 한 AI 분석입니다.<br />개개인의 상황에 따라 실제 궁합은 다를 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
