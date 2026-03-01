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