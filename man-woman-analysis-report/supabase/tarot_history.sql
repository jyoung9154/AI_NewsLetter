-- 1. 타로 결과 히스토리 테이블 생성
CREATE TABLE IF NOT EXISTS public.tarot_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card1_id uuid REFERENCES public.tarot_cards(id) NOT NULL,
  card2_id uuid REFERENCES public.tarot_cards(id) NOT NULL,
  card3_id uuid REFERENCES public.tarot_cards(id) NOT NULL,
  message_id uuid REFERENCES public.tarot_general_messages(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 인덱스 생성 (빠른 조회를 위함)
CREATE INDEX IF NOT EXISTS idx_tarot_history_user_date ON public.tarot_history (user_id, created_at);

-- 3. RLS 설정
ALTER TABLE public.tarot_history ENABLE ROW LEVEL SECURITY;

-- 자신의 기록만 읽을 수 있음
CREATE POLICY "Users can read their own tarot history" 
ON public.tarot_history FOR SELECT 
USING (auth.uid() = user_id);

-- 자신의 기록만 추가할 수 있음
CREATE POLICY "Users can insert their own tarot history" 
ON public.tarot_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);
