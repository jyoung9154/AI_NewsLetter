-- Add new columns for subscription options
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS start_option VARCHAR(20) DEFAULT 'latest';
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS next_episode_to_send INTEGER;

-- Ensure email is unique
ALTER TABLE subscribers ADD CONSTRAINT subscribers_email_key UNIQUE (email);
