-- 1. Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    password TEXT NOT NULL,
    content TEXT NOT NULL,
    gender TEXT DEFAULT 'unknown' CHECK (gender IN ('male', 'female', 'unknown')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add Index for performance
CREATE INDEX IF NOT EXISTS idx_comments_episode_id ON public.comments(episode_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies
-- Allow anyone to read comments
DROP POLICY IF EXISTS "comments_public_read" ON public.comments;
CREATE POLICY "comments_public_read" ON public.comments FOR SELECT USING (true);

-- Allow anyone to insert comments
DROP POLICY IF EXISTS "comments_public_insert" ON public.comments;
CREATE POLICY "comments_public_insert" ON public.comments FOR INSERT WITH CHECK (true);

-- Allow service_role to manage all (for DELETE etc via API)
DROP POLICY IF EXISTS "comments_service_admin" ON public.comments;
CREATE POLICY "comments_service_admin" ON public.comments FOR ALL USING (true) WITH CHECK (true);
