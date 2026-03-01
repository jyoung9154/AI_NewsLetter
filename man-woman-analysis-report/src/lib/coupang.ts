import { CoupangItem } from '@/types';

export class CoupangAffiliateService {
  private affiliateId: string;
  private baseApiUrl: string;

  constructor(affiliateId: string) {
    this.affiliateId = affiliateId;
    this.baseApiUrl = 'https://api.coupang.com';
  }

  // 쿠팡이츠 API를 통한 상품 검색
  async searchProducts(query: string, category?: string, gender?: 'male' | 'female' | 'both'): Promise<CoupangItem[]> {
    try {
      const params = new URLSearchParams({
        query,
        affiliateId: this.affiliateId,
      });

      if (category) params.append('category', category);
      if (gender) params.append('genderTarget', gender);

      const response = await fetch(`${this.baseApiUrl}/products?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      return this.transformProductData(data);
    } catch (error) {
      console.error('쿠팡 상품 검색 오류:', error);
      return this.getFallbackProducts(query, gender);
    }
  }

  // 상품 데이터 변환
  private transformProductData(apiData: any): CoupangItem[] {
    return apiData.products?.map((product: any) => ({
      productId: product.productId,
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      discountRate: product.discountRate,
      image: product.imageUrl,
      affiliateUrl: this.generateAffiliateUrl(product.productId),
      category: product.category,
      genderTarget: product.genderTarget || 'both',
    })) || [];
  }

  // 파트너스 링크 생성
  private generateAffiliateUrl(productId: string): string {
    return `https://link.coupang.com/a/${this.affiliateId}?itemId=${productId}`;
  }

  // Fallback 데이터 (API 연동 실패 시)
  private getFallbackProducts(query: string, gender?: 'male' | 'female' | 'both'): CoupangItem[] {
    const fallbackProducts: CoupangItem[] = [
      {
        productId: 'sample-001',
        title: `${query} 관련 추천 상품`,
        description: 'API 연동이 임시로 사용되는 샘플 상품입니다.',
        price: 29800,
        originalPrice: 59000,
        discountRate: 49,
        image: '/placeholder-product.jpg',
        affiliateUrl: '#',
        category: query,
        genderTarget: gender || 'both',
      },
    ];

    return fallbackProducts;
  }

  // 카테고리별 상품 추천
  async getRecommendedByCategory(category: string, gender?: 'male' | 'female' | 'both'): Promise<CoupangItem[]> {
    return this.searchProducts(category, category, gender);
  }

  // 인기 상품 가져오기
  async getPopularProducts(gender: 'male' | 'female' | 'both' = 'both', limit: number = 10): Promise<CoupangItem[]> {
    return this.searchProducts('인기', undefined, gender).then(products => products.slice(0, limit));
  }
}

// 전역 인스턴스 생성 (실제 사용 시 환경 변수에서 affiliateId 가져오기)
export const coupangService = new CoupangAffiliateService(process.env.NEXT_PUBLIC_COUPANG_AFFILIATE_ID || 'demo-affiliate-id');