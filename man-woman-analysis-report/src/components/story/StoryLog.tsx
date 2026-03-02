import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { DbEpisode } from '@/types';

interface StoryLogProps {
  episode: DbEpisode;
}

export function StoryLog({ episode }: StoryLogProps) {
  const [voted, setVoted] = useState<'none' | 'female' | 'male'>('none');
  const [voteStats, setVoteStats] = useState({ female: episode.vote_female || 0, male: episode.vote_male || 0 });
  const [message, setMessage] = useState('');
  const [viewCount, setViewCount] = useState(episode.view_count || 0);
  const [shareCount, setShareCount] = useState(episode.share_count || 0);

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
      const url = `${window.location.origin}/?episode=${episode.id}`;

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

      <div className="border-t border-gray-100 pt-8 mt-6">
        <h3 className="text-section text-center text-gray-800 mb-6 font-serif">결론 및 제안</h3>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-purple-100">
          <p className="text-gray-800 text-body-lg mb-6 whitespace-pre-line">{episode.resolution}</p>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">💡</div>
              <p className="text-gray-700 text-body pt-1 whitespace-pre-line">{episode.advice}</p>
            </div>
          </div>
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
