import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { GenderThemeProvider } from '@/components/ui/GenderThemeProvider';

const pretendard = localFont({
  src: '../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-pretendard',
  weight: '100 900',
});


export const metadata: Metadata = {
  title: {
    default: '남녀분석보고서 - 공감과 해답을 주는 연애 뉴스레터',
    template: '%s | 남녀분석보고서',
  },
  description: '서로 다른 행성에서 온 커플들을 위한 번역기. 남녀의 관계, 심리, 대화법을 깊이 있게 분석하는 스토리텔링형 뉴스레터',
  keywords: ['남녀관계', '심리분석', '연애상담', '뉴스레터', '연애조언', '데이트코스', '화해하는법', '커뮤니케이션'],
  authors: [{ name: '남녀분석보고서 팀' }],
  creator: '남녀분석보고서',
  publisher: '남녀분석보고서',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://man-woman-analysis-report.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://man-woman-analysis-report.vercel.app',
    title: '남녀분석보고서 | 관계의 모든 것',
    description: '남녀의 관계, 심리, 라이프스타일을 깊이 있게 분석하는 스토리텔링형 뉴스레터',
    siteName: '남녀분석보고서',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '남녀분석보고서 메인 이미지',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '남녀분석보고서 | 관계의 모든 것',
    description: '남녀의 관계, 심리, 라이프스타일을 깊이 있게 분석하는 스토리텔링형 뉴스레터',
    images: ['/og-image.png'],
    creator: '@man_woman_report',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    other: {
      'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || '',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '남녀분석보고서',
              url: 'https://man-woman-analysis-report.vercel.app',
              description: '남녀의 관계, 심리, 대화법을 깊이 있게 분석하는 뉴스레터',
            }),
          }}
        />
        <GenderThemeProvider>
          {children}
        </GenderThemeProvider>
      </body>
    </html>
  );
}