'use client';

import React, { useState, useEffect } from 'react';

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';

export function TopBannerAd() {
    if (!ADSENSE_ID) return null;
    return (
        <div className="w-full bg-gray-50 py-3 border-b border-gray-100 text-center flex justify-center overflow-hidden">
            <div className="w-full min-h-[90px] flex items-center justify-center mx-4">
                {/* AdSense 설정 후 활성화 */}
            </div>
        </div>
    );
}

interface CoupangProduct {
    productId: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    discountRate?: number;
    image: string;
    affiliateUrl: string;
    category: string;
}

interface InFeedAdProps {
    keyword?: string;  // 에피소드에서 전달받은 키워드
    category?: string; // 표시 레이블
}

export function InFeedAd({ keyword = '데이트', category = '추천 상품' }: InFeedAdProps) {
    const [product, setProduct] = useState<CoupangProduct | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/coupang/products?keyword=${encodeURIComponent(keyword)}&limit=1`);
                if (!res.ok) throw new Error('fetch failed');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setProduct(data[0]);
                }
            } catch (e) {
                console.error('[InFeedAd] 상품 로드 실패:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [keyword]);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl p-6 md:p-8 border border-pink-100 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
                <div className="h-10 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
            </div>
        );
    }

    if (!product) return null;

    const discountText = product.discountRate && product.discountRate > 0
        ? ` (${product.discountRate}% 할인)`
        : '';
    const priceText = product.price > 0
        ? `${product.price.toLocaleString()}원${discountText}`
        : '';

    return (
        <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block max-w-2xl mx-auto my-12 bg-white rounded-2xl p-6 md:p-8 border border-pink-100 shadow-sm group hover:border-pink-300 hover:shadow-md transition-all cursor-pointer no-underline"
        >
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">
                💝 오늘의 {category}
            </span>
            <h4 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                {product.title}
            </h4>
            {product.description && (
                <p className="text-gray-600 mb-4 leading-relaxed max-w-lg text-sm">
                    {product.description}
                </p>
            )}
            {priceText && (
                <p className="text-pink-600 font-bold text-lg mb-6">{priceText}</p>
            )}
            <span className="inline-block bg-gray-900 group-hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full text-sm transition-transform transform group-hover:scale-105 shadow-md">
                쿠팡에서 확인하기 →
            </span>
            <span className="text-[10px] text-gray-300 mt-4 block text-center">
                이 링크는 쿠팡 파트너스 제휴 링크입니다. 구매 시 일정 수수료가 지급됩니다.
            </span>
        </a>
    );
}
