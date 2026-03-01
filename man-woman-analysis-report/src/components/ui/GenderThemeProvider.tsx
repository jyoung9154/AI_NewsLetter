'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { genderThemes, GenderTheme } from '@/types';

interface GenderThemeContextType {
  theme: GenderTheme;
  isMale: boolean;
  isFemale: boolean;
}

const GenderThemeContext = createContext<GenderThemeContextType | undefined>(undefined);

interface GenderThemeProviderProps {
  children: ReactNode;
  gender?: 'male' | 'female' | 'both';
}

export function GenderThemeProvider({ children, gender = 'both' }: GenderThemeProviderProps) {
  // 기본 테마 설정 (both일 경우 남성 테마 사용)
  const theme = gender === 'female' ? genderThemes.female : genderThemes.male;

  const contextValue: GenderThemeContextType = {
    theme,
    isMale: gender === 'male' || gender === 'both',
    isFemale: gender === 'female' || gender === 'both',
  };

  return (
    <GenderThemeContext.Provider value={contextValue}>
      <div 
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          fontFamily: theme.typography.bodyFont,
        }}
      >
        {children}
      </div>
    </GenderThemeContext.Provider>
  );
}

export function useGenderTheme() {
  const context = useContext(GenderThemeContext);
  if (context === undefined) {
    throw new Error('useGenderTheme must be used within a GenderThemeProvider');
  }
  return context;
}