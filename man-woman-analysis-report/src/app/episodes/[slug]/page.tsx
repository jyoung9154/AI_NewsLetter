import { Metadata } from 'next';
import { getSupabaseService } from '@/lib/supabase';
import { StoryLog } from '@/components/story/StoryLog';
import { InFeedAd } from '@/components/ads/Ads';
import Link from 'next/link';

// Dynamically generate metadata for each episode for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const supabase = getSupabaseService();
    const { data: episode } = await supabase
        .from('episodes')
        .select('*')
        .eq('slug', params.slug)
        .single();

    if (!episode) {
        return {
            title: '에피소드를 찾을 수 없습니다 | 남녀분석보고서',
        };
    }

    const title = `Episode ${episode.episode_number}. ${episode.title}`;
    const description = episode.hook || episode.situation?.substring(0, 150) || '남녀의 다양한 심리 분석 스토리';

    return {
        title,
        description,
        alternates: {
            canonical: `https://man-woman-analysis-report.vercel.app/episodes/${episode.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'article',
            url: `https://man-woman-analysis-report.vercel.app/episodes/${episode.slug}`,
            images: episode.image_url
                ? [{ url: episode.image_url }]
                : [{ url: '/og-image.png', width: 1200, height: 630 }],
            siteName: '남녀분석보고서',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: episode.image_url ? [episode.image_url] : ['/og-image.png'],
        },
    };
}

export default async function EpisodePage({ params }: { params: { slug: string } }) {
    const supabase = getSupabaseService();
    const { data: episode } = await supabase
        .from('episodes')
        .select('*')
        .eq('slug', params.slug)
        .single();

    if (!episode) {
        return (
            <div className="min-h-screen bg-white py-32 text-center flex flex-col items-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">에피소드를 찾을 수 없습니다.</h1>
                <Link href="/" className="text-pink-600 hover:underline">
                    홈으로 돌아가기
                </Link>
            </div>
        );
    }

    // JSON-LD structured data for Google Search Rich Results (Article schema)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: episode.title,
        description: episode.hook || episode.situation,
        image: episode.image_url ? [episode.image_url] : [],
        datePublished: episode.published_at || episode.created_at,
        dateModified: episode.updated_at || episode.published_at || episode.created_at,
        author: [{
            '@type': 'Organization',
            name: '남녀분석보고서',
            url: 'https://man-woman-analysis-report.vercel.app',
        }],
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="py-8 px-4 sm:px-6 max-w-5xl mx-auto">
                <Link
                    href="/"
                    className="mb-8 inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
                >
                    ← <span className="underline underline-offset-4">목록으로 돌아가기</span>
                </Link>

                <StoryLog episode={episode} />

                <div className="mt-12 border-t border-gray-100 pt-8">
                    <InFeedAd category="연관 상품" keyword={episode.coupang_keyword || episode.tags?.[0]} />
                </div>
            </main>
        </div>
    );
}
