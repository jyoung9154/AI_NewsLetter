export interface Newsletter {
  id: string;
  title: string;
  content: string;
  category: 'story' | 'analysis' | 'advice' | 'couple';
  targetGender: 'male' | 'female' | 'both';
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  readTime: number;
  featuredImage?: string;
}

export interface DbEpisode {
  id: string;
  slug?: string;
  episode_number: number;
  title: string;
  hook?: string;
  situation: string;
  female_text: string;
  female_thought: string;
  male_text: string;
  male_thought: string;
  resolution: string;
  advice: string;
  dialogue?: string; // 1번: 대화 재현
  expert_analysis?: string; // 2번: 심리 분석관
  probability_stats?: { reason: string; percentage: number }[]; // 3번: 확률표
  worst_response?: { male: string; female: string }; // 4번: 최악의 응수
  selected_block_type?: number; // 2, 3, 4 중 선택된 블록 타입
  next_teaser?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  share_count: number;
  vote_female: number;
  vote_male: number;
  coupang_keyword?: string;
  coupang_product_url?: string;
  image_url?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CoupangItem {
  productId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  image: string;
  affiliateUrl: string;
  category: string;
  genderTarget: 'male' | 'female' | 'both';
}

export interface User {
  id: string;
  name: string;
  email: string;
  gender?: 'male' | 'female';
  preferences: {
    categories: string[];
    readTime: 'short' | 'medium' | 'long';
    notifications: boolean;
  };
  subscription: {
    plan: 'free' | 'premium';
    expiresAt?: string;
  };
}

export interface GenderTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  styles: {
    borderRadius: string;
    spacing: {
      sm: string;
      md: string;
      lg: string;
    };
  };
}

export const genderThemes = {
  male: {
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#f8fafc',
      text: '#1e293b',
    },
    typography: {
      headingFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
    },
    styles: {
      borderRadius: '0.375rem',
      spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
      },
    },
  },
  female: {
    colors: {
      primary: '#be185d',
      secondary: '#ec4899',
      accent: '#f472b6',
      background: '#fdf2f8',
      text: '#4c1d95',
    },
    typography: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Lora, serif',
    },
    styles: {
      borderRadius: '0.75rem',
      spacing: {
        sm: '0.625rem',
        md: '1.25rem',
        lg: '1.875rem',
      },
    },
  },
} as const;