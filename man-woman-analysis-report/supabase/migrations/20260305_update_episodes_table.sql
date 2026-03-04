-- Add missing columns for dynamic content (Badges)
ALTER TABLE public.episodes 
ADD COLUMN IF NOT EXISTS dialogue TEXT,
ADD COLUMN IF NOT EXISTS expert_analysis TEXT,
ADD COLUMN IF NOT EXISTS probability_stats JSONB,
ADD COLUMN IF NOT EXISTS worst_response JSONB,
ADD COLUMN IF NOT EXISTS selected_block_type INTEGER;

-- Add comment count column to episodes for better performance (optional but recommended)
-- ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
