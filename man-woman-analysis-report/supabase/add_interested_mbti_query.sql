ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS interested_mbti TEXT CHECK (char_length(interested_mbti) = 4);
