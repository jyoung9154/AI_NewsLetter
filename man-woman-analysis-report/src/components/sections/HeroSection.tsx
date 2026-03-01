'use client';

import { Button } from '@/components/ui/Button';
import { useGenderTheme } from '@/components/ui/GenderThemeProvider';

interface HeroSectionProps {
  onGenderSelect: (gender: 'male' | 'female' | 'neutral') => void;
}

export function HeroSection({ onGenderSelect }: HeroSectionProps) {
  const { theme, isMale, isFemale } = useGenderTheme();

  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* 배경 그라데이션 디자인 */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100 via-white to-blue-100 opacity-50"></div>
        
        <div className="relative z-10">
          {/* 메인 헤드라인 */}
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            <span className="block text-pink-600">남자여자분석보고서</span>
            <span className="block text-blue-600 mt-2">가장 가깝고도 먼 두 행성을</span>
            <span className="block mt-2 text-gray-800">데이터와 심리로 해독하는 성별 알고리즘</span>
          </h1>

          {/* 서브 헤드라인 */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            연애하다 보면 꼭 한 번쯤 이런 생각 하시죠? <br/>
            <span className="font-medium text-pink-600">"이 사람... 나랑 아예 다른 행성에서 왔나?"</span><br/>
            네, 맞습니다. 애초에 생각하는 회로(OS) 자체가 다르니까요!
          </p>

          {/* 성별 선택 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant="female"
              size="lg"
              onClick={() => onGenderSelect('female')}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              👩‍🦰 여성 전용 모드
            </Button>
            <Button
              variant="male"
              size="lg"
              onClick={() => onGenderSelect('male')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              👨‍🦱 남성 전용 모드
            </Button>
            <Button
              variant="neutral"
              size="lg"
              onClick={() => onGenderSelect('neutral')}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              🌍 혼합 모드
            </Button>
          </div>

          {/* 스토리텔링 예시 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border-2 border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
              💬 스토리로그 예시
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* 여성용 스토리 */}
              <div className="bg-pink-50 p-6 rounded-xl border-2 border-pink-200">
                <h4 className="font-bold text-pink-800 mb-3">👩‍🦱 여성 독자를 위한 번역</h4>
                <div className="space-y-3">
                  <p className="text-sm text-pink-700">
                    <strong>나:</strong> "오빠, 나 오늘 진짜 스트레스받아서 체한 것 같아 ㅠㅠ"
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>그:</strong> "헐, 소화제 먹었어? 빨리 약 먹고 누워있어."
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    <strong>나 (속마음):</strong> (아니, 약은 내가 알아서 먹지.. 누가 속상하게 했냐고 먼저 물어봐야 하는 거 아니야?)
                  </p>
                </div>
                <p className="text-sm text-pink-600 mt-4">
                  💡 번역기 가동 중... <br/>
                  남자의 뇌는 '문제 해결'에 최적화된 1코어 프로세서!<br/>
                  악의는 0%, 그저 당신의 문제를 가장 빨리 없애주고 싶은 본능일 뿐이에요!
                </p>
              </div>

              {/* 남성용 스토리 */}
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3">👨‍🦱 남성 독자를 위한 번역</h4>
                <div className="space-y-3">
                  <p className="text-sm text-pink-700">
                    <strong>그녀:</strong> "알았어. 오빠 하고 싶은 대로 해."
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>나:</strong> "어, 진짜? 고마워! 나 그럼 친구들이랑 게임 한 판만 하고 올게!"
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    <strong>나 (속마음):</strong> (내가 또 뭘 잘못한 거지...? 분명 마음대로 하라고 했는데...)
                  </p>
                </div>
                <p className="text-sm text-blue-600 mt-4">
                  💡 번역기 가동 중... <br/>
                  여자의 언어는 숨은 맥락(Context)의 집합체!<br/>
                  "맘대로 해"는 결코 허락이 아니죠.
                </p>
              </div>
            </div>
          </div>

          {/* 구독 유도 문구 */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              📬 매주 1회, 여러분의 메일함으로 찾아갑니다
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              서로를 더 깊이 이해하고 싶다면, 불필요한 감정 소모를 줄이고 싶다면?<br/>
              매주 3분, 커피 한 잔 마시며 [남자여자분석보고서]를 열어보세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}