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
    const [products, setProducts] = useState<CoupangProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Fetch up to 3 products
                const res = await fetch(`/api/coupang/products?keyword=${encodeURIComponent(keyword)}&limit=3`);
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
            <div className="w-full my-12 bg-white rounded-2xl p-6 md:p-8 border border-pink-100 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-6 relative"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
        <div className="w-full my-12 bg-white rounded-2xl p-6 md:p-8 border border-pink-100 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-6 text-center">
                💝 오늘의 {category}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
