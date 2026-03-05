-- 댓글 테이블에 대댓글(parent_id)과 좋아요(likes) 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
