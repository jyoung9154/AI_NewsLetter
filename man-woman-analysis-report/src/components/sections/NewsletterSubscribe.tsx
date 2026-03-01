'use client';

import { useState } from 'react';
import { useGenderTheme } from '@/components/ui/GenderThemeProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface NewsletterSubscribeProps {
  gender: 'male' | 'female' | 'neutral';
}

export function NewsletterSubscribe({ gender }: NewsletterSubscribeProps) {
  const { theme, isMale, isFemale } = useGenderTheme();
  const [email, setEmail] = useState('');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'both'>('both');
  const [selectedMbti, setSelectedMbti] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setError('');

    // 이메일 유효성 검사
    if (!email || !isValidEmail(email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      setIsSubscribing(false);
      return;
    }

    try {
      // 1. /api/subscribe API 연동
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          gender: selectedGender,
          mbti: selectedMbti || undefined,
          age_group: selectedAge || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('구독 요청 실패');
      }

      // 성공 처리
      setIsSubscribed(true);
      setEmail('');

      // 성공 알림
      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);

    } catch (err) {
      setError('구독 과정에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getBenefits = () => {
    if (gender === 'male') {
      return [
        '📊 매주 남성 관심 분석 리포트',
        '💼 효율적인 커뮤니케이션 팁',
        '🎯 관계 개선을 위한 실용적 가이드',
        '📈 직장 및 연애에서의 성공 전략',
      ];
    } else if (gender === 'female') {
      return [
        '💖 매주 여성 심리 분석 리포트',
        '🌸 자기 표현과 감정 관리 팁',
        '🤝 이해를 위한 공감 기술 가이드',
        '💕 건강한 관계 형성 전략',
      ];
    } else {
      return [
        '🔍 남녀 관계 심리 분석 리포트',
        '💡 커플 커뮤니케이션 기술',
        '🌈 건강한 관계 형성 가이드',
        '📊 관계 통계 및 데이터 분석',
      ];
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            뉴스레터 구독하기
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            매주 3분, 남녀 관계의 모든 것을 데이터와 심리로 해독하는 스토리텔링 뉴스레터를 받아보세요.
            <br />
            오늘 구독하면 이번 주 특별 콘텐츠를 즉시 받을 수 있습니다!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* 구독 양식 */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-2xl border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  {isSubscribed ? '✅ 구독 완료!' : '📧 구독 신청'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubscribed ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      성공적으로 구독되었습니다!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      이제 매주 재영님의 메일함으로 뉴스레터가 발송됩니다.
                    </p>
                    <p className="text-sm text-gray-500">
                      첫 번호는 내일 오후 2시에 도착할 예정입니다.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 주소
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
                      />
                      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        관심 있는 성별
                      </Label>
                      <Select value={selectedGender} onValueChange={(value: any) => setSelectedGender(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="선택해주세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">🌍 남녀 모두에게 관심 있어요</SelectItem>
                          <SelectItem value="male">👨‍🦱 남성 관심 콘텐츠를 원해요</SelectItem>
                          <SelectItem value="female">👩‍🦱 여성 관심 콘텐츠를 원해요</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-2">
                        맞춤형 콘텐츠를 위해 선택해주세요. 언제든지 변경할 수 있습니다.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* MBTI 선택 */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          MBTI <span className="text-gray-400 font-normal">(선택)</span>
                        </Label>
                        <Select value={selectedMbti} onValueChange={(value: any) => setSelectedMbti(value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'].map(mbti => (
                              <SelectItem key={mbti} value={mbti}>{mbti}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 연령대 선택 */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          연령대 <span className="text-gray-400 font-normal">(선택)</span>
                        </Label>
                        <Select value={selectedAge} onValueChange={(value: any) => setSelectedAge(value)}>
                          <SelectTrigger className="w-full">
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
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">🎁 구독 혜택</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {getBenefits().slice(0, 2).map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">
                        + 더 많은 혜택을 확인하고 싶으시면 구독하세요!
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubscribing}
                      className="w-full py-4 px-6 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubscribing ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          구독 중...
                        </span>
                      ) : (
                        '무료로 구독하기'
                      )}
                    </Button>

                    <div className="text-center text-xs text-gray-500">
                      <p>
                        개인정보 처리방침에 따라 정보를 안전하게 처리합니다.
                        <br />
                        언제든지 구독을 취소할 수 있습니다.
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 이점 안내 */}
          <div className="order-1 lg:order-2">
            <div className="space-y-6">
              {/* 구독 혜택 */}
              <Card className="shadow-xl border-2 border-gray-100">
                <CardHeader>
                  <CardTitle className="text-xl">🎁 구독하시면 이런 혜택이 있어요</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {getBenefits().map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-2xl">{benefit.charAt(0)}</span>
                        <span className="text-gray-700">{benefit.substring(2)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 통계 */}
              <Card className="shadow-xl border-2 border-gray-100">
                <CardHeader>
                  <CardTitle className="text-xl">📊 지금까지 10,000+ 분의 독자</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-pink-600">94%</div>
                      <div className="text-sm text-gray-600">만족도</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">3.2분</div>
                      <div className="text-sm text-gray-600">평균 읽는 시간</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-500">
                    매주 새로운 분석 콘텐츠로 관계를 개선하세요!
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="shadow-xl border-2 border-gray-100">
                <CardHeader>
                  <CardTitle className="text-xl">❓ 자주 묻는 질문</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">Q: 언제 뉴스레터가 도착하나요?</h4>
                    <p className="text-sm text-gray-600 mt-1">A: 매주 월요일 오후 2시에 발송됩니다.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Q: 비용이 들나요?</h4>
                    <p className="text-sm text-gray-600 mt-1">A: 현재 모든 콘텐츠를 무료로 제공하고 있습니다.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Q: 언제든지 취소할 수 있나요?</h4>
                    <p className="text-sm text-gray-600 mt-1">A: 네, 언제든지 이메일로 취소 요청이 가능합니다.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}