-- comments 테이블에 user_id 컬럼 추가 (소셜 로그인 사용자 식별용)
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
