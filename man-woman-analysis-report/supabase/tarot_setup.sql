-- 1. 타로 카드 테이블 생성
CREATE TABLE public.tarot_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  card_number INT NOT NULL UNIQUE, -- 0~77 (Major 0-21, Minor 22-77)
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  image_url TEXT,
  content_general TEXT NOT NULL, -- 일반적인 의미
  content_love_single TEXT NOT NULL, -- 솔로 연애운
  content_love_couple TEXT NOT NULL, -- 커플 연애운
  is_major BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS 설정 (누구나 읽기 가능하게)
ALTER TABLE public.tarot_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to tarot_cards" ON public.tarot_cards FOR SELECT USING (true);

-- 3. 샘플 데이터 (메이저 아르카나 일부)
INSERT INTO public.tarot_cards (card_number, name_en, name_ko, content_general, content_love_single, content_love_couple, is_major)
VALUES 
(0, 'The Fool', '광대', 
 '새로운 시작, 자유로움, 순수함을 상징합니다. 여행이나 새로운 모험이 시작될 때 나타나는 카드입니다.', 
 '새로운 인연이 갑작스럽게 찾아올 수 있습니다. 마음을 열고 가벼운 마음으로 다가가 보세요.', 
 '서로에게 구속받지 않는 자유로운 관계를 원하게 됩니다. 함께 새로운 취미를 시작해보는 것이 좋습니다.', 
 true),
(1, 'The Magician', '마법사', 
 '능력, 창의성, 의지력을 상징합니다. 당신의 잠재력을 발휘하여 원하는 것을 이룰 준비가 되었음을 의미합니다.', 
 '당신의 매력이 최고조에 달해 있습니다. 자신감을 가지고 고백하거나 대화의 주도권을 잡아보세요.', 
 '서로에 대한 열정이 샘솟는 시기입니다. 창의적인 데이트나 깜짝 선물로 분위기를 전환해보세요.', 
 true),
(6, 'The Lovers', '연인', 
 '사랑, 조화, 신뢰, 선택을 의미합니다. 진실한 감정의 교감과 중요한 결정을 내릴 때 나타납니다.', 
 '운명적인 만남이 예상됩니다. 당신의 마음이 이끄는 대로 솔직하게 행동하세요.', 
 '서로에 대한 믿음이 더욱 깊어지는 시기입니다. 중요한 결정을 함께 내리기에 최적의 타이밍입니다.', 
 true);
