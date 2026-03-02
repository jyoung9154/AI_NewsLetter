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
        // 메인 페이지 내부 탭들은 SEO 관점에서 개별 페이지가 아니므로 중요도를 낮추거나 제거할 수 있지만 기존 유지
        {
            url: `${BASE_URL}/#story`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/#analysis`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
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
