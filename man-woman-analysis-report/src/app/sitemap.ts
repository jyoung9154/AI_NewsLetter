import { MetadataRoute } from 'next';
import { getSupabaseService } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://man-woman-analysis-report.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date().toISOString();

    // 기본 정적 페이지들
    const routes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: 'always',
            priority: 1.0,
        },
    ];

    try {
        const supabase = getSupabaseService();
        // 최신순으로 활성화된 에피소드 가져오기
        const { data: episodes } = await supabase
            .from('episodes')
            .select('slug, published_at, created_at')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (episodes && episodes.length > 0) {
            const episodeRoutes = episodes.map((episode) => ({
                url: `${BASE_URL}/episodes/${episode.slug}`,
                lastModified: episode.published_at || episode.created_at || now,
                changeFrequency: 'weekly' as const,
                priority: 0.9, // 개별 에피소드는 검색 노출의 핵심이므로 높은 우선순위 부여
            }));

            return [...routes, ...episodeRoutes];
        }
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }

    return routes;
}
