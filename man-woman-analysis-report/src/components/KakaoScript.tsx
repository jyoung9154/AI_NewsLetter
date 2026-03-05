'use client';

import Script from 'next/script';

export function KakaoScript() {
    return (
        <Script
            src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
            strategy="afterInteractive"
            onLoad={() => {
                const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY || 'cd80ff0fca951f062a069084d804f8a9';
                if (window.Kakao && !window.Kakao.isInitialized()) {
                    window.Kakao.init(kakaoKey);
                }
            }}
        />
    );
}
