import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper to get authenticated server client
async function getSupabaseAuthClient() {
    const cookieStore = await cookies();
    return createServerClient(
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
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const episodeId = searchParams.get('episodeId');

        const supabase = await getSupabaseAuthClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ isBookmarked: false });
        }

        if (episodeId) {
            const { data } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .eq('episode_id', episodeId)
                .single();

            return NextResponse.json({ isBookmarked: !!data });
        } else {
            const { data, error } = await supabase
                .from('bookmarks')
                .select(`
                  episode_id,
                  created_at,
                  episodes (*)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return NextResponse.json(data);
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { episodeId } = await request.json();
        if (!episodeId) {
            return NextResponse.json({ error: 'episodeId is required' }, { status: 400 });
        }

        const supabase = await getSupabaseAuthClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: existing } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', user.id)
            .eq('episode_id', episodeId)
            .single();

        if (existing) {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('id', existing.id);
            if (error) throw error;
            return NextResponse.json({ message: 'Bookmark removed', isBookmarked: false });
        } else {
            const { error } = await supabase
                .from('bookmarks')
                .insert([{ user_id: user.id, episode_id: episodeId }]);
            if (error) throw error;
            return NextResponse.json({ message: 'Bookmarked', isBookmarked: true });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
