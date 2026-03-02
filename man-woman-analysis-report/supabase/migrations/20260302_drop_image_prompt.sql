-- image_prompt 컬럼 삭제
ALTER TABLE episodes DROP COLUMN IF EXISTS image_prompt;
