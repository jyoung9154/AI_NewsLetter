'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!email) {
            setStatus('error');
            return;
        }

        fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success');
                    // 3초 뒤 메인 페이지로 리다이렉트
                    setTimeout(() => {
                        router.push('/');
                    }, 3000);
                } else {
                    setStatus('error');
                }
            })
            .catch(() => {
                setStatus('error');
            });
    }, [email, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                {status === 'loading' && (
                    <>
                        <div className="text-4xl mb-4 animate-spin">⏳</div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">수신거부 처리 중...</h1>
                        <p className="text-gray-500">잠시만 기다려주세요.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="text-4xl mb-4">✅</div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">수신거부 되었습니다</h1>
                        <p className="text-gray-500 mb-4">
                            더 이상 뉴스레터를 발송하지 않겠습니다.<br />
                            3초 후 메인 페이지로 이동합니다.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="text-indigo-600 font-medium hover:underline"
                        >
                            지금 바로 이동하기 →
                        </button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="text-4xl mb-4">⚠️</div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">처리에 실패했습니다</h1>
                        <p className="text-gray-500 mb-4">
                            올바르지 않은 요청이거나 일시적인 오류입니다.<br />
                            문제가 지속되면 관리자에게 문의해주세요.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="text-indigo-600 font-medium hover:underline"
                        >
                            메인 페이지로 이동 →
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-spin">⏳</div>
                    <p className="text-gray-500">로딩 중...</p>
                </div>
            </div>
        }>
            <UnsubscribeContent />
        </Suspense>
    );
}
