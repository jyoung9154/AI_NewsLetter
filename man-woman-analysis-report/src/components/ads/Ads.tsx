import React from 'react';

// 구글 애드센스가 실제로 설정되었을 때만 표시
// NEXT_PUBLIC_ADSENSE_CLIENT_ID 환경 변수가 없으면 렌더링하지 않음
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';

export function TopBannerAd() {
    // 애드센스 ID가 없으면 아무것도 렌더링하지 않음
    if (!ADSENSE_ID) return null;

    return (
        <div className="w-full bg-gray-50 py-3 border-b border-gray-100 text-center flex justify-center overflow-hidden">
            <div className="w-full min-h-[90px] flex items-center justify-center mx-4">
                {/* 
                  반응형 AdSense:
                  <ins className="adsbygoogle"
                       style={{ display: 'block' }}
                       data-ad-client={ADSENSE_ID}
                       data-ad-format="auto"
                       data-full-width-responsive="true"></ins>
                */}
            </div>
        </div>
    );
}

interface InFeedAdProps {
    category?: string;
}

export function InFeedAd({ category = '추천 상품' }: InFeedAdProps) {
    // 실제 서비스 시 쿠팡 파트너스 API(src/lib/coupang.ts) 연동
    return (
        <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl p-6 md:p-8 border border-pink-100 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:border-pink-300 transition-colors">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">💝 오늘의 {category}</span>
            <h4 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                말보다 향기로 먼저 사과하는 법
            </h4>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-lg">
                불편한 침묵을 깨는 건 의외로 작은 디테일에서 시작됩니다. 실제로 분위기를 부드럽게 풀었다는 후기가 많은 따뜻한 우디 향 디퓨저, 방 안에 은은하게 채워보는 건 어떨까요?
            </p>
            {/* 네이티브한 단일 CTA */}
            <button className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full text-sm transition-transform transform group-hover:scale-105 shadow-md">
                은은한 디퓨저 선물 구경하기 →
            </button>
            <span className="text-[10px] text-gray-300 mt-4 block">Sponsored by Coupang Affiliate</span>
        </div>
    );
}
