import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://man-woman-analysis-report.vercel.app';

export async function GET() {
    try {
        const supabase = getSupabaseService();
        
        // 최신순으로 활성화된 에피소드 50개 가져오기
        const { data: episodes, error } = await supabase
            .from('episodes')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // RSS XML 생성
        const rssItems = (episodes || []).map((episode) => {
            const pubDate = new Date(episode.published_at || episode.created_at).toUTCString();
            const link = `${BASE_URL}/episodes/${episode.slug}`;
            
            // 본문 내용 구성 (네이버 가이드에 따라 상세하게 제공)
            const content = `
                <![CDATA[
                    ${episode.image_url ? `<img src="${episode.image_url}" alt="${episode.title}" /><br/><br/>` : ''}
                    <p>${episode.situation}</p>
                    <h3>👩 여자의 시점</h3>
                    <p>${episode.female_text}</p>
                    <p><em>속마음: ${episode.female_thought}</em></p>
                    <h3>👨 남자의 시점</h3>
                    <p>${episode.male_text}</p>
                    <p><em>속마음: ${episode.male_thought}</em></p>
                    <br/>
                    <p><strong>💡 해법 및 조언:</strong></p>
                    <p>${episode.resolution}</p>
                    <p>${episode.advice}</p>
                    <br/>
                    <a href="${link}">자세히 보기</a>
                ]]>
            `.trim();

            return `
                <item>
                    <title><![CDATA[${episode.title}]]></title>
                    <link>${link}</link>
                    <guid isPermaLink="true">${link}</guid>
                    <pubDate>${pubDate}</pubDate>
                    <description><![CDATA[${episode.hook}]]></description>
                    <content:encoded>${content}</content:encoded>
                </item>
            `;
        }).join('');

        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
            <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
                <channel>
                    <title>남녀분석보고서 - 연애 심리 리포트</title>
                    <link>${BASE_URL}</link>
                    <description>2030 남녀의 심리를 예리하게 파헤치는 리얼 연애 심리 분석 보고서</description>
                    <language>ko-kr</language>
                    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
                    ${rssItems}
                </channel>
            </rss>
        `.trim();

        return new NextResponse(rssXml, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'max-age=0, s-maxage=3600',
            },
        });

    } catch (error) {
        console.error('RSS Feed generation error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
