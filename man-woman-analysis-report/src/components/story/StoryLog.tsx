'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertOctagon, TrendingUp, Brain } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { InFeedAd } from '@/components/ads/Ads';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { DbEpisode } from '@/types';

interface StoryLogProps {
  episode: DbEpisode;
}

function parseAdvice(advice: string) {
  if (!advice) return { male: '', female: '', general: '' };

  let male = '';
  let female = '';
  let general = '';

  if (advice.includes('/')) {
    const parts = advice.split('/');
    parts.forEach(p => {
      const text = p.trim();
      if (text.match(/남자\s*팁/i) || text.startsWith('남자')) {
        male = text.replace(/^(?:남자\s*팁|남자)\s*[:\-]*\s*/i, '').trim();
      } else if (text.match(/여자\s*팁/i) || text.startsWith('여자')) {
        female = text.replace(/^(?:여자\s*팁|여자)\s*[:\-]*\s*/i, '').trim();
      } else {
        general += (general ? ' ' : '') + text;
      }
    });
  }

  if (!male && !female) {
    const maleMatch = advice.match(/남자\s*팁\s*[:\-]?\s*([\s\S]*?)(?=여자\s*팁|$)/i);
    const femaleMatch = advice.match(/여자\s*팁\s*[:\-]?\s*([\s\S]*?)(?=남자\s*팁|$)/i);

    if (maleMatch || femaleMatch) {
      if (maleMatch) male = maleMatch[1].replace(/\/$/, '').trim();
      if (femaleMatch) female = femaleMatch[1].replace(/\/$/, '').trim();
      general = '';
    } else {
      general = advice;
    }
  }

  return { male, female, general };
}

export function StoryLog({ episode }: StoryLogProps) {
  const [voted, setVoted] = useState<'none' | 'female' | 'male'>('none');
  const [voteStats, setVoteStats] = useState({ female: episode.vote_female || 0, male: episode.vote_male || 0 });
  const [message, setMessage] = useState('');
  const [viewCount, setViewCount] = useState(episode.view_count || 0);
  const [shareCount, setShareCount] = useState(episode.share_count || 0);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>({});

  const toggleBlock = (blockType: number) => {
    setExpandedBlocks(prev => ({ ...prev, [blockType]: !prev[blockType] }));
  };

  // MBTI 반응 관련 상태
  const [selectedMbti, setSelectedMbti] = useState('');
  const [mbtiGender, setMbtiGender] = useState<'female' | 'male'>('female');
  const [mbtiReaction, setMbtiReaction] = useState<any>(null);
  const [isMbtiLoading, setIsMbtiLoading] = useState(false);
  const [mbtiError, setMbtiError] = useState('');

  // MBTI 반응 조회
  const fetchMbtiReaction = async (mbti: string, gender: string) => {
    if (!mbti) return;
    setIsMbtiLoading(true);
    setMbtiError('');
    setMbtiReaction(null);

    try {
      const res = await fetch(`/api/episodes/${episode.id}/mbti?mbti=${mbti}&gender=${gender}`);
      const data = await res.json();
      if (res.ok) {
        setMbtiReaction(data);
      } else {
        setMbtiError(data.message || data.error || '분석을 불러올 수 없습니다.');
      }
    } catch (err) {
      setMbtiError('오류가 발생했습니다.');
    } finally {
      setIsMbtiLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMbti) {
      fetchMbtiReaction(selectedMbti, mbtiGender);
    }
  }, [selectedMbti, mbtiGender, episode.id]);

  // 공유하기 핸들러
  const handleShare = async (platform: 'link' | 'twitter' | 'kakao') => {
    try {
      const url = `${window.location.origin}/episodes/${episode.slug}`;

      if (platform === 'link') {
        await navigator.clipboard.writeText(url);
        alert('링크가 복사되었습니다!');
      } else if (platform === 'twitter') {
        const text = encodeURIComponent(`[남녀분석보고서] ${episode.title}\n`);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
      }

      // 서버에 공유 기록
      const res = await fetch(`/api/episodes/${episode.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
      const data = await res.json();
      if (data.new_share_count) {
        setShareCount(data.new_share_count);
      }
    } catch (err) {
      console.error('공유하기 실패:', err);
    }
  };

  // 조회수 증가 API 호출
  useEffect(() => {
    fetch(`/api/episodes/${episode.id}/view`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.new_view_count) {
          setViewCount(data.new_view_count);
        }
      })
      .catch(console.error);
  }, [episode.id]);

  // 투표 API 호출
  const handleVote = async (gender: 'female' | 'male') => {
    if (voted !== 'none') return;

    try {
      const res = await fetch(`/api/episodes/${episode.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genderVote: gender })
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || '투표 실패');
        return;
      }

      setVoted(gender);
      setMessage(data.message);
      setVoteStats((prev: any) => ({
        ...prev,
        [gender]: prev[gender] + 1
      }));
    } catch (err) {
      console.error(err);
      setMessage('오류가 발생했습니다.');
    }
  };

  const totalVotes = voteStats.female + voteStats.male;
  const femalePercent = totalVotes > 0 ? Math.round((voteStats.female / totalVotes) * 100) : 0;
  const malePercent = totalVotes > 0 ? Math.round((voteStats.male / totalVotes) * 100) : 0;

  const episodeNumMatch = episode.title.match(/^Episode\s*(\d+)\.?\s*/i);
  const parsedNum = episodeNumMatch ? episodeNumMatch[1] : '';
  const episodeNum = episode.episode_number || parsedNum;
  const cleanTitle = episode.title.replace(/^Episode\s*\d+\.?\s*/i, '').trim();

  const { male: maleAdvice, female: femaleAdvice, general: generalAdvice } = parseAdvice(episode.advice || '');

  return (
    <article className="max-w-3xl mx-auto my-12 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 transition-all">
      <header className="mb-12 text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <Badge variant="outline" className="text-pink-600 border-pink-200 bg-pink-50 px-4 py-1">
            {episodeNum ? `Episode.${episodeNum}` : 'Episode'}
          </Badge>
          <div className="text-gray-400 text-body-sm flex items-center gap-1">
            <span>👁️ {viewCount}</span>
            <span className="mx-1">·</span>
            <span>💬 {totalVotes}</span>
          </div>
        </div>
        <h1 className="text-hero text-gray-900 mb-6 font-serif tracking-tight">{cleanTitle}</h1>

        {/* Hook 영역 - 부드러운 인용구 스타일 */}
        {episode.hook && (
          <p className="text-body-lg text-gray-500 font-normal italic mb-8 border-l-2 border-gray-200 pl-4 text-left max-w-xl mx-auto">
            {episode.hook}
          </p>
        )}

        <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
          <p className="text-gray-500 text-body-sm uppercase tracking-wider mb-2">오늘의 상황</p>
          <p className="text-gray-800 text-body-lg whitespace-pre-line">{episode.situation}</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-8 mb-12 md:items-stretch">
        {/* 여성의 관점 */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-pink-600 text-section mb-4 font-serif border-b border-pink-100 pb-2">👩 그 여자의 솔직한 마음</h3>
          <p className="text-gray-800 text-body-lg mb-6 whitespace-pre-line">{episode.female_text}</p>
          <div className="bg-pink-50/50 rounded-2xl p-6 border border-pink-100 text-center flex-grow flex items-center justify-center min-h-[100px]">
            <p className="text-gray-600 italic text-body-sm">
              "{episode.female_thought}"
            </p>
          </div>
        </div>

        {/* 남성의 관점 */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-blue-600 text-section mb-4 font-serif border-b border-blue-100 pb-2">👨 그 남자의 현실적 사고</h3>
          <p className="text-gray-800 text-body-lg mb-6 whitespace-pre-line">{episode.male_text}</p>
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 text-center flex-grow flex items-center justify-center min-h-[100px]">
            <p className="text-gray-600 italic text-body-sm">
              "{episode.male_thought}"
            </p>
          </div>
        </div>
      </div>

      {/* 1번: 대화 재현 (필수 항목) */}
      {episode.dialogue && (
        <div className="mb-12 border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 border-b border-gray-100 p-4 shrink-0 flex items-center justify-center gap-2">
            <span className="text-xl">💬</span>
            <h3 className="text-section text-gray-900 font-serif m-0">파국으로 가는 실제 대화</h3>
          </div>
          <div className="p-5 md:p-8 bg-[#babcce] space-y-4 rounded-b-3xl">
            {episode.dialogue.split('\n').filter(line => line.trim().length > 0).map((line, idx) => {
              const isFemale = line.includes('👩');
              const isMale = line.includes('👨');
              const content = line.replace(/^[👩👨]+[:\s]*/, '').trim();
              
              // 나레이션 등은 가운데 정렬
              if (!isFemale && !isMale) {
                return (
                  <div key={idx} className="flex justify-center my-2">
                    <span className="bg-black/15 text-white/90 px-3 py-1 rounded-full text-xs shrink-0">{line}</span>
                  </div>
                );
              }
              
              return (
                <div key={idx} className={`flex w-full gap-2 ${isFemale ? 'justify-start' : 'justify-end flex-row-reverse'}`}>
                  {/* 원형 프로필 아이콘 */}
                  <div className="flex flex-col items-center shrink-0 mt-0.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border-2 border-white ${
                      isFemale ? 'bg-pink-200' : 'bg-blue-200'
                    }`}>
                      {isFemale ? '👩' : '👨'}
                    </div>
                    <span className="text-[11px] text-white/80 mt-0.5 font-medium">{isFemale ? '여자' : '남자'}</span>
                  </div>
                  {/* 말풍선 */}
                  <div className={`max-w-[75%] md:max-w-[65%] px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words ${
                    isFemale 
                      ? 'bg-white text-gray-900 rounded-2xl rounded-tl-[4px]' 
                      : 'bg-[#fee500] text-gray-900 rounded-2xl rounded-tr-[4px]'
                  }`}>
                    <p className="whitespace-pre-line m-0">{content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2~4번: 데이터가 있는 블록마다 독립 토글 아코디언 */}
      <div className="space-y-4 mb-12">

        {/* === Type 2: 심리 분석 === */}
        {episode.expert_analysis && (
          <div>
            <button 
              onClick={() => toggleBlock(2)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 hover:border-purple-300 rounded-2xl p-5 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
                  <Brain size={20} />
                </div>
                <h3 className="text-section font-bold text-gray-900 m-0 text-left">🕵️ 심리 분석관의 팩트체크</h3>
              </div>
              {expandedBlocks[2] ? <ChevronUp className="text-gray-400 group-hover:text-purple-500" /> : <ChevronDown className="text-gray-400 group-hover:text-purple-500" />}
            </button>
            {expandedBlocks[2] && (
              <div className="mt-3 p-6 md:p-8 rounded-2xl border bg-purple-50/30 border-purple-100 animate-fade-in">
                <p className="text-gray-800 text-body-lg leading-relaxed whitespace-pre-line font-medium text-center">
                  "{episode.expert_analysis}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* === Type 3: 확률 통계 === */}
        {episode.probability_stats && Array.isArray(episode.probability_stats) && (
          <div>
            <button 
              onClick={() => toggleBlock(3)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl p-5 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-section font-bold text-gray-900 m-0 text-left">📊 에디터의 뇌피셜 확률표</h3>
              </div>
              {expandedBlocks[3] ? <ChevronUp className="text-gray-400 group-hover:text-emerald-500" /> : <ChevronDown className="text-gray-400 group-hover:text-emerald-500" />}
            </button>
            {expandedBlocks[3] && (
              <div className="mt-3 p-6 md:p-8 rounded-2xl border bg-emerald-50/30 border-emerald-100 animate-fade-in">
                <div className="space-y-4">
                  {episode.probability_stats.map((stat: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="flex justify-between text-body-sm font-medium mb-1">
                        <span className="text-gray-700">{stat.reason}</span>
                        <span className="text-emerald-700 font-bold">{stat.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-3 rounded-full" 
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === Type 4: 최악의 응수 === */}
        {episode.worst_response && (
          <div>
            <button 
              onClick={() => toggleBlock(4)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 hover:border-red-300 rounded-2xl p-5 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                  <AlertOctagon size={20} />
                </div>
                <h3 className="text-section font-bold text-gray-900 m-0 text-left">⚠️ 절대 하면 안 되는 최악의 응수</h3>
              </div>
              {expandedBlocks[4] ? <ChevronUp className="text-gray-400 group-hover:text-red-500" /> : <ChevronDown className="text-gray-400 group-hover:text-red-500" />}
            </button>
            {expandedBlocks[4] && (
              <div className="mt-3 p-6 md:p-8 rounded-2xl border bg-red-50/30 border-red-100 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-red-400"></div>
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 mb-3 block w-max">👩 여자의 최악수</Badge>
                    <p className="text-gray-800 font-bold">"{episode.worst_response.female}"</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-red-400"></div>
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 mb-3 block w-max">👨 남자의 최악수</Badge>
                    <p className="text-gray-800 font-bold">"{episode.worst_response.male}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 오늘의 연관상품 */}
      {episode.coupang_keyword && (
        <div className="mb-8">
          <InFeedAd category="🛍️ 오늘의 연관상품" keyword={episode.coupang_keyword} />
        </div>
      )}

      <div className="border-t border-gray-100 pt-8 mt-6">
        <h3 className="text-section text-center text-gray-800 mb-6 font-serif">결론 및 제안</h3>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-purple-100">
          <div className="flex items-start gap-4 mb-8">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">💡</div>
            <p className="text-gray-800 text-body-lg pt-1 whitespace-pre-line font-medium leading-relaxed">{episode.resolution}</p>
          </div>

          {(maleAdvice || femaleAdvice) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {femaleAdvice && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-pink-50 rounded-bl-full opacity-50 -z-0"></div>
                  <h4 className="relative z-10 text-pink-600 font-bold mb-3 flex items-center gap-2">
                    <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded text-[10px] tracking-wider font-extrabold">포인트</span>
                    🙋‍♀️ 여자 팁
                  </h4>
                  <p className="relative z-10 text-gray-700 leading-relaxed text-body-sm whitespace-pre-line break-keep">{femaleAdvice}</p>
                </div>
              )}
              {maleAdvice && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full opacity-50 -z-0"></div>
                  <h4 className="relative z-10 text-blue-600 font-bold mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] tracking-wider font-extrabold">포인트</span>
                    🙋‍♂️ 남자 팁
                  </h4>
                  <p className="relative z-10 text-gray-700 leading-relaxed text-body-sm whitespace-pre-line break-keep">{maleAdvice}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-50">
              <p className="text-gray-700 text-body whitespace-pre-line leading-relaxed">{generalAdvice || episode.advice}</p>
            </div>
          )}
        </div>
      </div>

      {/* 공유하기 및 통계 바 */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-8 mt-8">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <span className="text-gray-500 text-body-sm bg-gray-50 px-3 py-1 rounded-full">조회 {viewCount}</span>
          <span className="text-gray-500 text-body-sm bg-gray-50 px-3 py-1 rounded-full">공유 {shareCount}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleShare('twitter')} className="px-4 py-2 bg-[#1DA1F2] text-white rounded-xl text-body-sm font-bold hover:bg-[#1a8cd8] transition-colors shadow-sm">
            🐦 트위터
          </button>
          <button onClick={() => handleShare('link')} className="px-4 py-2 bg-gray-800 text-white rounded-xl text-body-sm font-bold hover:bg-gray-700 transition-colors shadow-sm">
            🔗 링크 복사
          </button>
        </div>
      </div>

      {/* 인터랙티브 투표 - 참여 유도 */}
      <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 mb-12">
        <h3 className="text-section text-gray-900 mb-6">당신은 어느 쪽에 더 공감하나요?</h3>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => handleVote('female')}
            disabled={voted !== 'none'}
            className={`flex-1 max-w-xs px-6 py-4 rounded-xl font-bold transition-all shadow-sm flex flex-col items-center gap-2 ${voted === 'female' ? 'bg-pink-600 text-white shadow-md transform scale-105' : voted !== 'none' ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-600'}`}
          >
            <span>🙋‍♀️ 여자 (그녀의 마음)</span>
            {voted !== 'none' && <span className="text-2xl">{femalePercent}%</span>}
          </button>
          <button
            onClick={() => handleVote('male')}
            disabled={voted !== 'none'}
            className={`flex-1 max-w-xs px-6 py-4 rounded-xl font-bold transition-all shadow-sm flex flex-col items-center gap-2 ${voted === 'male' ? 'bg-blue-600 text-white shadow-md transform scale-105' : voted !== 'none' ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}
          >
            <span>🙋‍♂️ 남자 (그의 생각)</span>
            {voted !== 'none' && <span className="text-2xl">{malePercent}%</span>}
          </button>
        </div>
        {message && (
          <p className={`mt-6 text-body-sm font-bold animate-pulse ${message.includes('실패') || message.includes('오류') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>
        )}
      </div>

      {/* MBTI 반응 카드 섹션 (신규 기능) */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-2 text-purple-600 border-purple-200 bg-purple-50">✨ AI 심리 분석</Badge>
          <h3 className="text-section text-gray-900 font-serif">내 MBTI는 이 상황에서 어떻게 반응할까?</h3>
          <p className="text-gray-500 text-body-sm mt-2">16가지 성격 유형별 숨겨진 속마음을 확인해보세요.</p>
        </div>

        <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">성별</label>
              <Select value={mbtiGender} onValueChange={(v: any) => setMbtiGender(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="성별 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">여성 👩</SelectItem>
                  <SelectItem value="male">남성 👨</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">MBTI</label>
              <Select value={selectedMbti} onValueChange={setSelectedMbti}>
                <SelectTrigger>
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'].map(mbti => (
                    <SelectItem key={mbti} value={mbti}>{mbti}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isMbtiLoading ? (
            <div className="py-8 text-center text-gray-500 animate-pulse">분석 데이터를 불러오는 중...</div>
          ) : mbtiReaction ? (
            <div className={`p-5 rounded-xl border ${mbtiGender === 'female' ? 'bg-pink-50 border-pink-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{mbtiGender === 'female' ? '👩' : '👨'}</span>
                <span className="font-bold text-gray-900">{selectedMbti} {mbtiGender === 'female' ? '여성' : '남성'}의 속마음</span>
              </div>
              <p className="text-gray-800 leading-relaxed text-body whitespace-pre-line">"{mbtiReaction.reaction}"</p>
              <div className="mt-4 pt-4 border-t border-white/50 flex justify-between items-center text-sm">
                <span className="text-gray-500">상황 민감도</span>
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`w-2 h-4 rounded-sm ${i < mbtiReaction.sensitivity ? (mbtiGender === 'female' ? 'bg-pink-400' : 'bg-blue-400') : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>
          ) : mbtiError ? (
            <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <span className="text-2xl mb-2 block">😅</span>
              {mbtiError}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              위험 요소나 숨은 의도를 파악해드려요.<br />MBTI를 선택해보세요!
            </div>
          )}
        </div>
      </div>

      {/* 다음 회차 예고편 (Teaser) */}
      {episode.next_teaser && (
        <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-200 text-center">
          <span className="inline-block bg-gray-900 text-white text-body-sm px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Next Episode</span>
          <p className="text-gray-600 font-serif text-body-lg italic">{episode.next_teaser}</p>
        </div>
      )}
    </article>
  );
}
