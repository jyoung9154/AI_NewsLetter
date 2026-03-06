import React from 'react';
import { MyPageContent } from '@/components/mypage/MyPageContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '마이페이지',
    description: '저장한 에피소드와 나만의 연애 인사이트 모아보기',
};

export default function MyPage() {
    return <MyPageContent />;
}
