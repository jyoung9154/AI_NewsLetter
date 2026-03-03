import { Metadata } from 'next';
import { getSupabaseService } from '@/lib/supabase';
import { StoryLog } from '@/components/story/StoryLog';
import { InFeedAd } from '@/components/ads/Ads';
import Link from 'next/link';

// Helper to parse episode number from slug (e.g., "episode-6" -> 6)
function parseEpisodeNumber(slug: string): number | null {
    if (!slug) return null;

    // Support both "episode-6" and "6" formats for robustness
    const match = slug.match(/^(?:episode-)?(\d+)$/i);
    if (match) {
        return parseInt(match[1], 10);
    }
    return null;
}

// Dynamically generate metadata for each episode for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const supabase = getSupabaseService();
    const episodeNum = parseEpisodeNumber(params.slug);

    if (episodeNum === null) {
        return { title: '에피소드를 찾을 수 없습니다 | 남녀분석보고서' };
    }

    const { data: episode } = await supabase
        .from('episodes')
        .select('*')
        .eq('episode_number', episodeNum)
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
        openGraph: {
            title,
            description,
            type: 'article',
            url: `https://man-woman-analysis-report.vercel.app/episodes/episode-${episode.episode_number}`,
            images: episode.image_url ? [{ url: episode.image_url }] : [],
            siteName: '남녀분석보고서',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: episode.image_url ? [episode.image_url] : [],
        },
    };
}

export default async function EpisodePage({ params }: { params: { slug: string } }) {
    const supabase = getSupabaseService();
    const episodeNum = parseEpisodeNumber(params.slug);

    let episode = null;
    if (episodeNum !== null) {
        const { data } = await supabase
            .from('episodes')
            .select('*')
            .eq('episode_number', episodeNum)
            .single();
        episode = data;
    }

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
        dateModified: episode.created_at,
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
