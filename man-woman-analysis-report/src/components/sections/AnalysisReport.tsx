'use client';

import { useState } from 'react';
import { useGenderTheme } from '@/components/ui/GenderThemeProvider';
import { Button } from '@/components/ui/Button';
import { AnalysisCard } from '@/components/ui/AnalysisCard';
import { Newsletter } from '@/types';

interface AnalysisReportProps {
  gender: 'male' | 'female' | 'neutral';
}

export function AnalysisReport({ gender }: AnalysisReportProps) {
  const { theme, isMale, isFemale } = useGenderTheme();
  const [selectedCategory, setSelectedCategory] = useState<'story' | 'analysis' | 'advice'>('analysis');

  // 샘플 분석 리포트 데이터
  const analysisReports: Newsletter[] = [
    {
      id: 'report-001',
      title: '"알았어"라는 말의 서로 다른 인코딩과 디코딩',
      content: '상황: 다툼 도중 여자가 "알았어(Fine)"라고 말하고 입을 닫았다. 남자는 정말 상황이 정리된 줄 알고 게임을 켰다.',
      category: 'analysis',
      targetGender: 'both',
      createdAt: '2026-02-28',
      updatedAt: '2026-02-28',
      author: '남녀분석보고서 팀',
      tags: ['커뮤니케이션', '오해', '언어 차이'],
      readTime: 3,
    },
    {
      id: 'report-002',
      title: '남자의 "동굴"과 여자의 "대화" - 스트레스 해소 알고리즘',
      content: '스트레스를 받았을 때 남성은 혼자의 시간을 통해, 여성은 대화를 통해 해소하는 방식의 차이를 분석합니다.',
      category: 'story',
      targetGender: 'both',
      createdAt: '2026-02-21',
      updatedAt: '2026-02-21',
      author: '남녀분석보고서 팀',
      tags: ['스트레스', '심리학', '진화심리학'],
      readTime: 4,
    },
  ];

  // 카테고리별 필터링
  const filteredReports = analysisReports.filter(report =>
    report.category === selectedCategory &&
    (report.targetGender === gender || report.targetGender === 'both')
  );

  // 남성/여성별 맞춤형 해결책
  const getActionItems = () => {
    if (gender === 'male') {
      return [
        '질문하기: "지금 내가 뭘 잘못했을까?"',
        '경청하기: "아니, 내가 잘못한 거 없어"라는 말은 듣지 마세요',
        '공감하기: "내가 무심했던 것 같아 미안해"',
      ];
    } else if (gender === 'female') {
      return [
        '표현하기: "지금은 화가 나서 정리가 필요해"',
        '기다리기: 남자가 반응할 시간을 주세요',
        '이해하기: 그의 단순함은 악의가 없다는 뜻입니다',
      ];
    } else {
      return [
        '소통하기: 서로의 감정 표현 방식을 이해하세요',
        '존중하기: 상대의 방식을 존중하면서 자신의 감정도 표현하세요',
        '협력하기: 함께 문제 해결의 방법을 찾아보세요',
      ];
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            분석 리포트
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            남녀의 사고 방식과 감정 표현을 데이터와 심리학으로 깊이 분석합니다.
            <br />
            오해를 줄이고 관계를 개선하는 실용적인 가이드를 제공합니다.
          </p>
        </div>

        {/* 카테고리 선택 */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full shadow-lg p-2 flex gap-2">
            <Button
              variant={selectedCategory === 'analysis' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('analysis')}
              className="px-6 py-2"
            >
              심리 분석
            </Button>
            <Button
              variant={selectedCategory === 'story' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('story')}
              className="px-6 py-2"
            >
              사례 연구
            </Button>
            <Button
              variant={selectedCategory === 'advice' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('advice')}
              className="px-6 py-2"
            >
              해결책
            </Button>
          </div>
        </div>

        {/* 리포트 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredReports.map((report) => (
            <AnalysisCard key={report.id} report={report} />
          ))}
        </div>

        {/* [Trigger] [Analysis] [Data View] [Action Item] 형식 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-16 border-2 border-gray-100">
          <h3 className="text-2xl font-bold mb-8 text-center">분석 리포트 템플릿</h3>

          {/* Trigger 섹션 */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-pink-600 mb-4">🔥 [TRIGGER] 상황 제시</h4>
            <div className="bg-pink-50 p-6 rounded-xl border-l-4 border-pink-500">
              <p className="text-gray-700">
                <strong>상황:</strong> 다툼 후 여성이 "알았어"라고 말하고 침묵함. 남성은 해결된 줄 알고 게임을 시작함.
              </p>
            </div>
          </div>

          {/* Analysis 섹션 */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-blue-600 mb-4">🧠 [ANALYSIS] 심리 분석</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                <h5 className="font-bold text-blue-800 mb-3">남성의 인지 방식</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 종결 신호: 논리적 마무리에 집중</li>
                  <li>• 언어 필터: 텍스트 그대로 해석</li>
                  <li>• 행동 기제: 해결됐으니 휴식 모드</li>
                </ul>
              </div>
              <div className="bg-pink-50 p-6 rounded-xl border-l-4 border-pink-500">
                <h5 className="font-bold text-pink-800 mb-3">여성의 인지 방식</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 감정 신호: 대화의 질과 연결감에 집중</li>
                  <li>• 언어 필터: 숨은 맥락 이해 필요</li>
                  <li>• 행동 기제: 침묵으로 공감 기다림</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data View 섹션 */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-green-600 mb-4">📊 [DATA VIEW] 데이터 시각화</h4>
            <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-700">73%</div>
                  <div className="text-sm text-gray-600">여성이 "알았어"를 감정적 신호로 해석</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">87%</div>
                  <div className="text-sm text-gray-600">남성이 "알았어"를 논리적 종료로 해석</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">65%</div>
                  <div className="text-sm text-gray-600">오해로 인한 불필요한 갈등 발생</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Item 섹션 */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-purple-600 mb-4">💡 [ACTION ITEM] 해결책</h4>
            <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h5 className="font-bold text-purple-800 mb-4">이제 실천할 행동들</h5>
              <ul className="space-y-3">
                {getActionItems().map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 구독 유도 */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            매주 더 깊이 있는 분석 리포트를 받아보시겠어요?
          </p>
          <Button
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg"
            onClick={() => {
              document.getElementById('subscribe-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            구독하고 리포트 받기
          </Button>
        </div>
      </div>
    </section>
  );
}