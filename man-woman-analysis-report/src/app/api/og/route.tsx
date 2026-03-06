import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract query params
        const title = searchParams.has('title')
            ? searchParams.get('title')?.slice(0, 100)
            : '남녀분석보고서';
        const description = searchParams.has('desc')
            ? searchParams.get('desc')?.slice(0, 120)
            : '서로 다른 행성에서 온 커플들을 위한 번역기';
        const ep = searchParams.has('ep') ? searchParams.get('ep') : '';
        const imageUrl = searchParams.has('image') ? searchParams.get('image') : null;

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        backgroundColor: '#111827', // Dark background as fallback
                        padding: '80px',
                        position: 'relative',
                    }}
                >
                    {/* Background image layer */}
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.8
                            }}
                        />
                    )}

                    {/* Dark gradient overlay for text readability */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 60%, rgba(15, 23, 42, 0.1) 100%)',
                            zIndex: 1,
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 2,
                            color: 'white',
                            maxWidth: '850px',
                            fontFamily: 'sans-serif',
                        }}
                    >
                        {ep && (
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    color: '#f472b6', // pink-400
                                    marginBottom: 16,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    background: 'rgba(219, 39, 119, 0.2)', // pink-600 with opacity
                                    padding: '8px 16px',
                                    borderRadius: '9999px',
                                    border: '1px solid rgba(244, 114, 182, 0.4)',
                                }}
                            >
                                EPISODE {ep}
                            </div>
                        )}
                        <div
                            style={{
                                fontSize: 64,
                                fontWeight: 900,
                                lineHeight: 1.2,
                                marginBottom: 24,
                                wordBreak: 'keep-all',
                                textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            }}
                        >
                            {title}
                        </div>
                        {description && (
                            <div
                                style={{
                                    fontSize: 32,
                                    color: '#e2e8f0', // slate-200
                                    lineHeight: 1.5,
                                    maxWidth: '750px',
                                    wordBreak: 'keep-all',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                }}
                            >
                                {description}
                            </div>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginTop: 64,
                            }}
                        >
                            <div
                                style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: '#3b82f6', // blue-500
                                    marginRight: 12,
                                }}
                            />
                            <div
                                style={{
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: '#93c5fd', // blue-300
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                남녀분석보고서
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.error(e.message);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
