import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CookieOptions } from '@supabase/ssr';

// GET: 에피소드의 댓글 목록 불러오기 (대댓글 트리 구조)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');

    if (!episodeId) {
        return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 });
    }

    try {
        const supabase = getSupabaseService();

        // 최상위 댓글 (parent_id가 null인 것)
        const { data: topLevel, error: topError } = await supabase
            .from('comments')
            .select('*')
            .eq('episode_id', episodeId)
            .is('parent_id', null)
            .order('created_at', { ascending: true });

        if (topError) throw topError;

        // 대댓글 (parent_id가 있는 것)
        const { data: replies, error: replyError } = await supabase
            .from('comments')
            .select('*')
            .eq('episode_id', episodeId)
            .not('parent_id', 'is', null)
            .order('created_at', { ascending: true });

        if (replyError) throw replyError;

        // 트리 구조로 매핑
        const commentsWithReplies = (topLevel || []).map(comment => ({
            ...comment,
            replies: (replies || []).filter(r => r.parent_id === comment.id),
        }));

        return NextResponse.json(commentsWithReplies);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: 새 댓글 작성 (대댓글 지원)
export async function POST(request: Request) {
    try {
        const { episodeId, nickname, password, content, gender, parentId } = await request.json();

        // 필수 필드 체크 (에피소드 ID와 내용만 필수로 체크하고 나머지는 유동적으로 처리)
        if (!episodeId || !content) {
            return NextResponse.json({ error: 'Episode ID and content are required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabaseAuth = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabaseAuth.auth.getUser();

        const supabase = getSupabaseService();
        const insertData: any = {
            episode_id: episodeId,
            nickname: nickname || '익명',
            password: password || 'SOCIAL_AUTH', // 소셜 로그인 등으로 비밀번호가 없는 경우를 위한 더미 값
            content,
            gender: gender || 'unknown',
            user_id: user?.id || null, // 로그인한 유저면 ID 저장
        };

        // 대댓글인 경우 parent_id 추가
        if (parentId) {
            insertData.parent_id = parentId;
        }

        const { data, error } = await supabase
            .from('comments')
            .insert([insertData])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: 댓글 삭제 (비밀번호 또는 소유권 확인)
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get('id');
        const password = searchParams.get('password');

        if (!commentId) {
            return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabaseAuth = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabaseAuth.auth.getUser();
        const supabase = getSupabaseService();

        // 1. 기존 댓글 정보 확인 (비밀번호 및 작성자 ID)
        const { data: existingComment, error: fetchError } = await supabase
            .from('comments')
            .select('password, user_id')
            .eq('id', commentId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // 2. 권한 확인: 본인이거나 비밀번호가 일치해야 함
        const isOwner = user && existingComment.user_id === user.id;
        const isPasswordCorrect = password && existingComment.password === password;

        if (!isOwner && !isPasswordCorrect) {
            return NextResponse.json({ error: 'Unauthorized: Incorrect password or not the owner' }, { status: 403 });
        }

        // 3. 삭제 수행
        const { error: deleteError } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: 댓글 좋아요 +1
export async function PATCH(request: Request) {
    try {
        const { commentId } = await request.json();

        if (!commentId) {
            return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
        }

        const supabase = getSupabaseService();

        // 현재 좋아요 수 조회
        const { data: comment, error: fetchError } = await supabase
            .from('comments')
            .select('likes')
            .eq('id', commentId)
            .single();

        if (fetchError || !comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // +1 업데이트
        const { data, error } = await supabase
            .from('comments')
            .update({ likes: (comment.likes || 0) + 1 })
            .eq('id', commentId)
            .select('id, likes')
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
