'use client';

import { useState, useEffect } from 'react';
import { useGenderTheme } from '@/components/ui/GenderThemeProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CoupangItem } from '@/types';

interface CoupangAffiliateProps {
  gender: 'male' | 'female' | 'neutral';
}

export function CoupangAffiliate({ gender }: CoupangAffiliateProps) {
  const { theme, isMale, isFemale } = useGenderTheme();
  const [products, setProducts] = useState<CoupangItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 샘플 쿠팡 파트너스 상품 데이터
  const sampleProducts: CoupangItem[] = [
    {
      productId: '100001',
      title: '남성용 스트레스 해소 마사지기',
      description: '직장 스트레스로 인한 근육 긴장 완화에 최적화된 전신 마사지기',
      price: 59800,
      originalPrice: 89000,
      discountRate: 33,
      image: '/images/massage-device.jpg',
      affiliateUrl: 'https://coupa.ng/b123456',
      category: '건강',
      genderTarget: 'male',
    },
    {
      productId: '100002',
      title: '여성용 감정 관리 오일 세트',
      description: '자연의 힘으로 감정을 진정시키고 마음의 평화를 찾아주는 에센셜 오일',
      price: 35000,
      originalPrice: 52000,
      discountRate: 33,
      image: '/images/oil-set.jpg',
      affiliateUrl: 'https://coupa.ng/b123457',
      category: '웰니스',
      genderTarget: 'female',
    },
    {
      productId: '100003',
      title: '커플 커뮤니케이션 가이드북',
      description: '남녀 간의 오해를 줄이고 깊은 관계를 형성하기 위한 실용적 가이드',
      price: 18000,
      originalPrice: 25000,
      discountRate: 28,
      image: '/images/communication-book.jpg',
      affiliateUrl: 'https://coupa.ng/b123458',
      category: '관계',
      genderTarget: 'both',
    },
    {
      productId: '100004',
      title: '남성용 효율적인 시간 관리 플래너',
      description: '바쁜 현대인을 위한 목표 달성 시스템으로 관계와 업무의 균형 찾기',
      price: 22000,
      originalPrice: 32000,
      discountRate: 31,
      image: '/images/planner.jpg',
      affiliateUrl: 'https://coupa.ng/b123459',
      category: '자기계발',
      genderTarget: 'male',
    },
    {
      productId: '100005',
      title: '여성용 감정 표현 다이어리',
      description: '자신의 감정을 기록하고 표현하며 자기 이해를 높이는 특별한 다이어리',
      price: 15000,
      originalPrice: 22000,
      discountRate: 32,
      image: '/images/emotional-diary.jpg',
      affiliateUrl: 'https://coupa.ng/b123460',
      category: '자기계발',
      genderTarget: 'female',
    },
    {
      productId: '100006',
      title: '커플 데이트 아이디어 도구세트',
      description: '관계에 활력을 불어넣는 창의적인 데이트 아이디어 100가지와 도구',
      price: 28000,
      originalPrice: 40000,
      discountRate: 30,
      image: '/images/date-kit.jpg',
      affiliateUrl: 'https://coupa.ng/b123461',
      category: '관계',
      genderTarget: 'both',
    },
  ];

  useEffect(() => {
    // 쿠팡 파트너스 API 호출 시뮬레이션
    const fetchProducts = async () => {
      setLoading(true);

      // 실제 API 연동 시:
      // const response = await fetch('/api/coupang/products');
      // const data = await response.json();
      // setProducts(data);

      // 현재는 샘플 데이터 사용
      setTimeout(() => {
        setProducts(sampleProducts);
        setLoading(false);
      }, 1000);
    };

    fetchProducts();
  }, [selectedCategory, gender]);

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const genderMatch =
      gender === 'neutral' ||
      product.genderTarget === gender ||
      product.genderTarget === 'both';
    return categoryMatch && genderMatch;
  });

  const categories = ['all', '건강', '웰니스', '관계', '자기계발'];

  const handleClickProduct = (product: CoupangItem) => {
    // 클릭 트래킹 및 쿠팡 파트너스 연동
    if (typeof window !== 'undefined') {
      // 실제 구현 시: 클릭 이벤트 전송
      console.log('Product clicked:', product.productId);

      // 새 탭에서 쿠팡 파트너스 링크 열기
      window.open(product.affiliateUrl, '_blank');
    }
  };

  const getZoneTitle = (zone: string) => {
    switch (zone) {
      case 'header':
        return '🔝 헤더 광고';
      case 'content':
        return '📝 본문 광고';
      case 'footer':
        return '🔽 푸터 광고';
      default:
        return '광고';
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            관련 추천 상품
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            남녀 관계와 심리 건강을 위한 쿠팡 파트너스 추천 상품입니다.
            <br />
            구매 시 소량의 수수료가 발생하며, 이는 뉴스레터 운영에 사용됩니다.
          </p>
        </div>

        {/* 카테고리 선택 */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="px-6 py-2"
            >
              {category === 'all' ? '전체' : category}
            </Button>
          ))}
        </div>

        {/* 3-zone 광고 배치 시스템 */}
        <div className="space-y-16">
          {/* Zone 1: Header 광고 */}
          <div className="bg-gradient-to-r from-pink-100 to-blue-100 rounded-2xl p-8 border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔝</span>
              <h3 className="text-xl font-bold text-gray-800">{getZoneTitle('header')}</h3>
              <Badge variant="secondary">주요 광고 영역</Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {filteredProducts.slice(0, 3).map((product) => (
                <Card
                  key={product.productId}
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleClickProduct(product)}
                >
                  <CardHeader className="pb-3">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-500 text-4xl">📦</span>
                    </div>
                    <Badge
                      variant={product.genderTarget === 'male' ? 'default' :
                        product.genderTarget === 'female' ? 'secondary' : 'outline'}
                      className="mb-2"
                    >
                      {product.genderTarget === 'male' ? '👨‍🦱 남성 추천' :
                        product.genderTarget === 'female' ? '👩‍🦱 여성 추천' : '🌍 모두 추천'}
                    </Badge>
                    <CardTitle className="text-lg line-clamp-2">
                      {product.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                          ₩{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₩{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.discountRate && (
                        <Badge variant="destructive" className="text-xs">
                          -{product.discountRate}%
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClickProduct(product);
                      }}
                    >
                      쿠팡에서 확인하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Zone 2: Content 광고 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📝</span>
              <h3 className="text-xl font-bold text-gray-800">{getZoneTitle('content')}</h3>
              <Badge variant="secondary">본문 광고 영역</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.slice(3, 6).map((product) => (
                <Card
                  key={product.productId}
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleClickProduct(product)}
                >
                  <CardHeader className="pb-3">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-500 text-4xl">📦</span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {product.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-red-600">
                        ₩{product.price.toLocaleString()}
                      </span>
                      {product.discountRate && (
                        <Badge variant="destructive" className="text-xs">
                          -{product.discountRate}%
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClickProduct(product);
                      }}
                    >
                      쿠팡에서 확인하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Zone 3: Footer 광고 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔽</span>
              <h3 className="text-xl font-bold text-gray-800">{getZoneTitle('footer')}</h3>
              <Badge variant="secondary">푸터 광고 영역</Badge>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {filteredProducts.slice(6).map((product) => (
                <Card
                  key={product.productId}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleClickProduct(product)}
                >
                  <CardHeader className="pb-2">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-gray-500 text-3xl">📦</span>
                    </div>
                    <CardTitle className="text-sm line-clamp-2">
                      {product.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-red-600">
                        ₩{product.price.toLocaleString()}
                      </span>
                      {product.discountRate && (
                        <Badge variant="destructive" className="text-xs">
                          -{product.discountRate}%
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClickProduct(product);
                      }}
                    >
                      확인
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* 수익화 정보 */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                💰 뉴스레터 지원 방법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl mb-2">🛒</div>
                  <h4 className="font-semibold mb-2">상품 구매</h4>
                  <p className="text-sm text-gray-600">
                    추천 상품을 구매하면<br />소량의 수수료가 발생
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">📧</div>
                  <h4 className="font-semibold mb-2">뉴스레터 구독</h4>
                  <p className="text-sm text-gray-600">
                    무료로 구독하고<br />유용한 콘텐츠를 받아보세요
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">📱</div>
                  <h4 className="font-semibold mb-2">SNS 공유</h4>
                  <p className="text-sm text-gray-600">
                    뉴스레터를 공유하고<br />친구들에게 알려주세요
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                발생한 수수료는 모두 뉴스레터 콘텐츠 개선과 운영에 사용됩니다.
                감사합니다! 🙏
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}