import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';

// GET: 에피소드의 댓글 목록 불러오기
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');

    if (!episodeId) {
        return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 });
    }

    try {
        const supabase = getSupabaseService();
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('episode_id', episodeId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: 새 댓글 작성
export async function POST(request: Request) {
    try {
        const { episodeId, nickname, password, content, gender } = await request.json();

        if (!episodeId || !nickname || !password || !content) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const supabase = getSupabaseService();
        const { data, error } = await supabase
            .from('comments')
            .insert([
                {
                    episode_id: episodeId,
                    nickname,
                    password, // 실제 프로덕션에서는 해싱 권장 (bcrypt 등)
                    content,
                    gender: gender || 'unknown'
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: 댓글 삭제 (비밀번호 확인)
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get('id');
        const password = searchParams.get('password');

        if (!commentId || !password) {
            return NextResponse.json({ error: 'Comment ID and password are required' }, { status: 400 });
        }

        const supabase = getSupabaseService();

        // 1. 기존 댓글 비밀번호 확인
        const { data: existingComment, error: fetchError } = await supabase
            .from('comments')
            .select('password')
            .eq('id', commentId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        if (existingComment.password !== password) {
            return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
        }

        // 2. 일치하면 삭제
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
