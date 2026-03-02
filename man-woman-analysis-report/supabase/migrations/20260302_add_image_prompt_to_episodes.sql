-- episodes 테이블에 image_prompt 컬럼 추가
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS image_prompt TEXT;
