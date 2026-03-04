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
    offset?: number;
}

export function InFeedAd({ keyword = '데이트', category = '추천 상품', offset = 0 }: InFeedAdProps) {
    const [products, setProducts] = useState<CoupangProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Fetch up to 3 products
                const res = await fetch(`/api/coupang/products?keyword=${encodeURIComponent(keyword)}&limit=3&offset=${offset}`);
                if (!res.ok) throw new Error('fetch failed');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setProducts(data);
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
            <div className="w-full my-8 md:my-12 bg-white rounded-2xl p-4 md:p-8 border border-pink-100 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-6 relative"></div>
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col gap-3">
                            <div className="w-full aspect-square bg-gray-100 rounded-xl"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div className="w-full my-8 md:my-12 bg-white rounded-2xl p-4 md:p-8 border border-pink-100 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-6 text-center">
                💝 오늘의 {category}
            </span>
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                {products.map((product) => {
                    const discountText = product.discountRate && product.discountRate > 0
                        ? ` (${product.discountRate}% 할인)`
                        : '';
                    const priceText = product.price > 0
                        ? `${product.price.toLocaleString()}원${discountText}`
                        : '';

                    return (
                        <a
                            key={product.productId}
                            href={product.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="flex flex-col group cursor-pointer no-underline"
                        >
                            <div className="w-full aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden relative border border-gray-100">
                                {product.image ? (
                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                            </div>

                            <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors line-clamp-2">
                                {product.title}
                            </h4>

                            {priceText && (
                                <p className="text-pink-600 font-bold text-sm mb-3">{priceText}</p>
                            )}

                            <span className="inline-block bg-gray-50 border border-gray-200 group-hover:border-pink-300 group-hover:bg-pink-50 text-gray-700 group-hover:text-pink-600 font-bold py-2 w-full text-center rounded-lg text-xs transition-colors">
                                구경하기
                            </span>
                        </a>
                    );
                })}
            </div>
            <span className="text-[10px] text-gray-400 mt-6 block text-center">
                이 링크는 쿠팡 파트너스 제휴 링크입니다. 구매 시 일정 수수료가 지급됩니다.
            </span>
        </div>
    );
}

/**
 * 쿠팡 파트너스 다이나믹 배너 (고객 관심 기반 추천 - API 기반)
 */
export function DynamicCoupangAd() {
    const [products, setProducts] = useState<CoupangProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // '추천템' 또는 '인기상품' 키워드로 일반적인 추천 리스트 확보
                const res = await fetch(`/api/coupang/products?keyword=${encodeURIComponent('인기상품')}&limit=4`);
                if (!res.ok) throw new Error('fetch failed');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setProducts(data);
                }
            } catch (e) {
                console.error('[DynamicCoupangAd] 추천 상품 로드 실패:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    if (loading) {
        return (
            <div className="w-full my-12 bg-gray-50 rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-6 mx-auto"></div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="min-w-[140px] flex-1">
                            <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div className="w-full my-8 relative group">
            {/* 배경 장식 (더 은은하게) */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-50/50 to-pink-50/50 rounded-2xl blur-lg opacity-40 transition duration-1000"></div>

            <div className="relative bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
                <div className="bg-gray-900 px-4 py-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-pink-500 animate-pulse"></span>
                        Recommended
                    </span>
                    <span className="text-[8px] text-gray-500">Interest-based</span>
                </div>

                <div className="p-3 md:p-4">
                    {/* 가로 스크롤 가능한 상품 리스트 (높이 축소) */}
                    <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        {products.map((product) => (
                            <a
                                key={product.productId}
                                href={product.affiliateUrl}
                                target="_blank"
                                rel="noopener noreferrer sponsored"
                                className="min-w-[120px] md:min-w-[150px] flex-1 group/item cursor-pointer snap-start"
                            >
                                <div className="h-28 md:h-32 bg-gray-50 rounded-xl mb-2 overflow-hidden border border-gray-50 relative">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        // object-contain으로 변경하여 이미지가 잘리지 않으면서 슬림하게 표현
                                        className="w-full h-full object-contain p-2 group-hover/item:scale-105 transition-transform duration-500"
                                    />
                                    {product.discountRate !== undefined && product.discountRate > 0 && (
                                        <div className="absolute top-1.5 right-1.5 bg-pink-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                            {product.discountRate}%
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-[11px] font-bold text-gray-800 line-clamp-1 mb-0.5 group-hover/item:text-pink-600 transition-colors">
                                    {product.title}
                                </h4>
                                <p className="text-[12px] font-black text-gray-900">
                                    {product.price.toLocaleString()}원
                                </p>
                            </a>
                        ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
                        <p className="text-[9px] text-gray-400 leading-tight">
                            이 포스팅은 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받습니다.
                        </p>
                        <a
                            href={products[0]?.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="bg-gray-900 text-white text-[11px] font-bold px-4 py-2 rounded-2xl hover:bg-gray-800 transition-colors shrink-0"
                        >
                            전체 상품 구경하기
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
