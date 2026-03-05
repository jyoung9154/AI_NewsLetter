'use client';

import Script from 'next/script';

export function KakaoScript() {
    return (
        <Script
            src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
            strategy="afterInteractive"
            onLoad={() => {
                if (window.Kakao && !window.Kakao.isInitialized()) {
                    window.Kakao.init('1ba8745c1109a9f24ef780dfcded20ae');
                }
            }}
        />
    );
}
