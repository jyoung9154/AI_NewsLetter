import { NextResponse } from 'next/server';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY || '';
const SECRET_KEY = process.env.COUPANG_SECRET_KEY || '';
const BASE_URL = 'https://api-gateway.coupang.com';

/**
 * 쿠팡 파트너스 API HMAC-SHA256 서명 생성
 */
function generateHmacSignature(method: string, path: string, query: string): { authorization: string; date: string } {
    const now = new Date();
    // 쿠팡 API 날짜 형식: YYMMDD'T'HHmmss'Z'
    const year2 = now.getUTCFullYear().toString().substring(2);
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = now.getUTCDate().toString().padStart(2, '0');
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    const seconds = now.getUTCSeconds().toString().padStart(2, '0');
    const date = `${year2}${month}${day}T${hours}${minutes}${seconds}Z`;

    // 서명 대상 문자열 (띄어쓰기/줄바꿈 없음)
    const message = `${date}${method}${path}${query}`;

    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(message)
        .digest('hex');

    const authorization = `CEA algorithm=HmacSHA256, access-key=${ACCESS_KEY}, signed-date=${date}, signature=${signature}`;

    return { authorization, date };
}

/**
 * GET /api/coupang/products?keyword=데이트&limit=3
 * 에피소드 키워드 기반 쿠팡 파트너스 상품 검색
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '데이트';
    const limit = parseInt(searchParams.get('limit') || '3');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!ACCESS_KEY || !SECRET_KEY) {
        console.warn('[Coupang API] Credentials not configured in Vercel. Using fallback products.');
        return NextResponse.json(getFallbackProducts(keyword));
    }

    // 쿠팡 파트너스 상품 검색 API
    const path = '/v2/providers/affiliate_open_api/apis/openapi/v1/products/search';
    const queryParams = new URLSearchParams({
        keyword,
        limit: String(limit + offset),
    });
    const queryString = queryParams.toString();

    const { authorization } = generateHmacSignature('GET', path, queryString);

    try {
        const response = await fetch(`${BASE_URL}${path}?${queryString}`, {
            method: 'GET',
            headers: {
                Authorization: authorization,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Coupang API] Error:', response.status, errorText);
            // API 실패 시 키워드 기반 fallback 상품 반환
            return NextResponse.json(getFallbackProducts(keyword));
        }

        const data = await response.json();

        // 쿠팡 API 응답 구조: { rCode, rMessage, data: { productData: [...] } }
        const products = data?.data?.productData || [];
        const formatted = products.slice(offset, offset + limit).map((p: any) => ({
            productId: String(p.productId),
            title: p.productName,
            description: p.productTypeName || '',
            price: p.productPrice,
            originalPrice: p.originalPrice || p.productPrice,
            discountRate: p.discountRate || 0,
            image: p.productImage,
            affiliateUrl: p.productUrl,
            category: keyword,
            genderTarget: 'both' as const,
        }));

        return NextResponse.json(formatted);
    } catch (error: any) {
        console.error('[Coupang API] Fetch error:', error.message);
        return NextResponse.json(getFallbackProducts(keyword));
    }
}

/**
 * 키워드별 Fallback 상품 (API 실패 시 사용)
 * 실제 쿠팡 파트너스 링크로 교체하세요
 */
function getFallbackProducts(keyword: string) {
    const productMap: Record<string, any[]> = {
        '데이트': [
            {
                productId: 'date-001',
                title: '커플 향초 선물 세트',
                description: '분위기 있는 데이트를 위한 은은한 향초 세트',
                price: 29800,
                originalPrice: 45000,
                discountRate: 34,
                image: '',
                affiliateUrl: `https://link.coupang.com/a/${ACCESS_KEY || '8c1c4c59-055b-4826-a29e-0738dae0522e'}`,
                category: '데이트',
                genderTarget: 'both',
            },
        ],
        '감정': [
            {
                productId: 'emotion-001',
                title: '마음챙김 감사 일기장',
                description: '매일 감사한 것을 기록하며 감정을 다스리는 다이어리',
                price: 14900,
                originalPrice: 21000,
                discountRate: 29,
                image: '',
                affiliateUrl: `https://link.coupang.com/a/${ACCESS_KEY || '8c1c4c59-055b-4826-a29e-0738dae0522e'}`,
                category: '감정',
                genderTarget: 'both',
            },
        ],
        '커플': [
            {
                productId: 'couple-001',
                title: '커플 커뮤니케이션 카드 게임',
                description: '서로를 더 잘 알아가는 대화 카드',
                price: 19800,
                originalPrice: 28000,
                discountRate: 29,
                image: '',
                affiliateUrl: `https://link.coupang.com/a/${ACCESS_KEY || '8c1c4c59-055b-4826-a29e-0738dae0522e'}`,
                category: '커플',
                genderTarget: 'both',
            },
        ],
        '선물': [
            {
                productId: 'gift-001',
                title: '감성 선물 포장 세트',
                description: '마음을 담은 선물 포장 리본&박스 세트',
                price: 8900,
                originalPrice: 15000,
                discountRate: 41,
                image: '',
                affiliateUrl: `https://link.coupang.com/a/${ACCESS_KEY || '8c1c4c59-055b-4826-a29e-0738dae0522e'}`,
                category: '선물',
                genderTarget: 'both',
            },
        ],
    };

    // 키워드 매핑
    const keywordMap: Record<string, string> = {
        '알았어': '감정', '침묵': '감정', '아무거나': '커플', '오해': '커플',
        '사과': '데이트', '화해': '데이트', '선물': '선물', '기념일': '선물',
    };

    const mappedKey = keywordMap[keyword] || Object.keys(productMap).find(k => keyword.includes(k)) || '데이트';
    return productMap[mappedKey] || productMap['데이트'];
}
