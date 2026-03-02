'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface SubscriptionPopupProps {
    email: string;
    onClose: () => void;
    onSuccess?: (message: string) => void;
}

export function SubscriptionPopup({ email, onClose, onSuccess }: SubscriptionPopupProps) {
    const [selectedMyGender, setSelectedMyGender] = useState<string>('');
    const [selectedMbti, setSelectedMbti] = useState<string>('');
    const [selectedInterestedMbti, setSelectedInterestedMbti] = useState<string>('');
    const [selectedAge, setSelectedAge] = useState<string>('');
    const [startOption, setStartOption] = useState<'latest' | 'first' | 'specific'>('latest');
    const [specificEpisode, setSpecificEpisode] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleExtraInfoSubmit = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    my_gender: selectedMyGender || undefined,
                    mbti: selectedMbti || undefined,
                    interested_mbti: selectedInterestedMbti || undefined,
                    age_group: selectedAge || undefined,
                    start_option: startOption,
                    specific_episode: startOption === 'specific' ? (parseInt(specificEpisode) || 1) : undefined
                })
            });

            if (res.ok) {
                if (onSuccess) onSuccess('상세 설정이 저장되었습니다! 💖');
                onClose();
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 구독 완료!</h3>
                    <p className="text-gray-600 text-sm">
                        더욱 정확한 남녀 심리 분석 커스텀 콘텐츠를 위해,<br />상세 설정을 완료해주세요 (선택)
                    </p>
                </div>

                {/* 에피소드 수신 옵션 */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-left">어느 에피소드부터 받으실래요?</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setStartOption('latest')}
                            className={`py-2 px-1 text-[11px] font-bold border rounded-lg transition-all ${startOption === 'latest' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            최신호부터
                        </button>
                        <button
                            onClick={() => setStartOption('first')}
                            className={`py-2 px-1 text-[11px] font-bold border rounded-lg transition-all ${startOption === 'first' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            1화부터
                        </button>
                        <button
                            onClick={() => setStartOption('specific')}
                            className={`py-2 px-1 text-[11px] font-bold border rounded-lg transition-all ${startOption === 'specific' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            직접 입력
                        </button>
                    </div>
                    {startOption === 'specific' && (
                        <div className="mt-2">
                            <input
                                type="number"
                                min="1"
                                placeholder="에피소드 번호 (예: 5)"
                                value={specificEpisode}
                                onChange={(e) => setSpecificEpisode(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
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
                        onClick={onClose}
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
    );
}
