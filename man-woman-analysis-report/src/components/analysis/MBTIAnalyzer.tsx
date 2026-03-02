import { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Loader2, Heart, Sparkles, AlertCircle, CheckCircle2, Share2, Download, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';

export function MBTIAnalyzer() {
    const [myMbti, setMyMbti] = useState<string>('');
    const [myGender, setMyGender] = useState<string>('');
    const [targetMbti, setTargetMbti] = useState<string>('');
    const [targetGender, setTargetGender] = useState<string>('');
    const [situation, setSituation] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const mbtiList = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

    // URL에서 결과 복원
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sharedResult = params.get('result');
        if (sharedResult) {
            try {
                // Base64 디코딩 (한글 대응)
                const decoded = decodeURIComponent(atob(sharedResult));
                const parsed = JSON.parse(decoded);
                setResult(parsed);
                // 결과가 있으면 페이지 최상단으로 이동 (제목과 결과가 한눈에 보이도록)
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 500);
            } catch (e) {
                console.error('Failed to parse shared result:', e);
            }
        }
    }, []);

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

    const handleSaveImage = async () => {
        if (!resultRef.current) return;

        try {
            const canvas = await html2canvas(resultRef.current, {
                backgroundColor: '#ffffff',
                scale: 2, // 고해상도
                useCORS: true,
                logging: false,
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `MBTI_궁합_분석_${myMbti}_${targetMbti}.png`;
            link.click();
        } catch (e) {
            console.error('이미지 저장 실패:', e);
            alert('이미지 저장 중 오류가 발생했습니다.');
        }
    };

    const handleCopyLink = (silent = false) => {
        if (!result) return;

        try {
            const jsonStr = JSON.stringify(result);
            const encoded = btoa(encodeURIComponent(jsonStr));
            const shareUrl = `${window.location.origin}${window.location.pathname}?result=${encoded}`;

            navigator.clipboard.writeText(shareUrl);
            if (!silent) alert('공유 링크가 클립보드에 복사되었습니다! 🔗');
            return shareUrl;
        } catch (e) {
            console.error('링크 복사 실패:', e);
            if (!silent) alert('링크 복사 중 오류가 발생했습니다.');
            return null;
        }
    };

    const handleSocialShare = (platform: 'kakao' | 'x' | 'facebook' | 'native') => {
        const shareUrl = handleCopyLink(true);
        if (!shareUrl) return;

        const text = `[남녀분석보고서] ${result.my_mbti} & ${result.target_mbti} 상황별 MBTI 궁합 분석 결과: "${result.summary}"`;

        switch (platform) {
            case 'native':
                if (navigator.share) {
                    navigator.share({
                        title: '남녀분석보고서 MBTI 궁합',
                        text: text,
                        url: shareUrl,
                    }).catch(console.error);
                } else {
                    handleCopyLink();
                }
                break;
            case 'x':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'kakao':
                // 카카오톡 공유 (JS SDK가 없을 경우의 차선책)
                window.open(`https://sharer.kakao.com/talk/friends/picker/link?app_key=YOUR_KAKAO_APP_KEY&link=${encodeURIComponent(shareUrl)}`, '_blank');
                // 참고: 실제 구현 시에는 YOUR_KAKAO_APP_KEY가 필요합니다. 
                // 지금은 링크 복사로 유도하거나 메시지를 띄웁니다.
                alert('카카오톡으로 공유하시려면 복사된 링크를 대화창에 붙여넣어 주세요! 😊');
                break;
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                    MBTI <span className="text-pink-600">상황별 궁합</span> 분석기
                </h2>
                <p className="text-gray-600">구체적인 상황을 입력하시면 맞춤형 연애 전략을 세워드립니다.</p>
            </div>

            {/* 결과 섹션 (분석 결과가 있을 때 제목 바로 아래 노출) */}
            {result && (
                <div className="animate-in fade-in slide-in-from-top-8 duration-1000 mb-16">
                    <div
                        ref={resultRef}
                        className="bg-gradient-to-br from-pink-50 to-white p-8 md:p-12 rounded-[2rem] border border-pink-100 shadow-xl overflow-hidden relative"
                    >
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
                            <p className="text-gray-500 text-[10px] mb-4">
                                [남녀분석보고서] 상위 1% 심리학 AI가 분석한 결과입니다.
                            </p>
                            <p className="text-gray-500 text-xs">
                                *이 결과는 보편적인 MBTI 성향을 바탕으로 한 AI 분석입니다.<br />개개인의 상황에 따라 실제 궁합은 다를 수 있습니다.
                            </p>
                        </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="mt-8 flex flex-col items-center gap-6 no-capture">
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={handleSaveImage}
                                className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-pink-200 transition-all flex items-center gap-2 hover:scale-105"
                            >
                                <Download size={18} /> 이미지로 저장하기
                            </button>
                            <button
                                onClick={() => handleCopyLink()}
                                className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl border border-gray-200 shadow-sm transition-all flex items-center gap-2 hover:scale-105"
                            >
                                <Copy size={18} /> 링크 복사
                            </button>
                        </div>

                        {/* 소셜 공유 아이콘들 */}
                        <div className="flex items-center gap-6">
                            <span className="text-sm font-bold text-gray-400">공유하기</span>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleSocialShare('kakao')}
                                    className="w-10 h-10 bg-[#FEE500] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    title="카카오톡 공유"
                                >
                                    <span className="text-xs font-bold text-[#3C1E1E]">Talk</span>
                                </button>
                                <button
                                    onClick={() => handleSocialShare('x')}
                                    className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    title="X(트위터) 공유"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </button>
                                <button
                                    onClick={() => handleSocialShare('facebook')}
                                    className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    title="페이스북 공유"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </button>
                                <button
                                    onClick={() => handleSocialShare('native')}
                                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:scale-110 transition-transform text-gray-600"
                                    title="기타 공유"
                                >
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center pb-12 border-b border-gray-100 mb-12">
                        <button
                            onClick={() => {
                                setResult(null);
                                setSituation('');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-gray-400 text-sm underline underline-offset-4 hover:text-gray-600"
                        >
                            분석 결과 초기화하고 다시 하기
                        </button>
                    </div>
                </div>
            )}

            {/* 입력 섹션 (결과 아래에 배치하지만 처음에는 상단) */}
            <div className={`transition-all duration-700 ${result ? 'opacity-50' : 'opacity-100'}`}>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* 본인 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
                <div className="text-center">
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
                                {result ? '다시 분석하기' : 'AI가 분석하는 궁합 확인하기'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
