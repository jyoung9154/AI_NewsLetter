-- ============================================================
-- 남녀분석보고서 Supabase DB 마이그레이션
-- Phase 1: 테이블 생성 + 초기 데이터
-- ============================================================

-- 1. episodes 테이블
CREATE TABLE IF NOT EXISTS episodes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_number  INTEGER NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  hook            TEXT,
  situation       TEXT NOT NULL,
  female_text     TEXT NOT NULL,
  female_thought  TEXT NOT NULL,
  male_text       TEXT NOT NULL,
  male_thought    TEXT NOT NULL,
  resolution      TEXT NOT NULL,
  advice          TEXT NOT NULL,
  next_teaser     TEXT,
  tags            TEXT[] DEFAULT '{}',
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  view_count      INTEGER DEFAULT 0,
  share_count     INTEGER DEFAULT 0,
  vote_female     INTEGER DEFAULT 0,
  vote_male       INTEGER DEFAULT 0,
  coupang_keyword     TEXT,
  coupang_product_url TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. subscribers 테이블 (기존 테이블 존재 시 컬럼 추가)
DO $$ 
BEGIN
  -- 테이블이 없으면 생성
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'subscribers') THEN
    CREATE TABLE subscribers (
      id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email             TEXT UNIQUE NOT NULL,
      name              TEXT,
      gender            TEXT CHECK (gender IN ('male','female','other')),
      mbti              TEXT CHECK (char_length(mbti) = 4),
      age_group         TEXT CHECK (age_group IN ('10s','20s','30s','40s','50s+')),
      gender_preference TEXT DEFAULT 'both',
      status            TEXT DEFAULT 'active' CHECK (status IN ('active','paused','unsubscribed')),
      unsubscribe_reason TEXT,
      open_count        INTEGER DEFAULT 0,
      click_count       INTEGER DEFAULT 0,
      last_opened_at    TIMESTAMPTZ,
      subscribed_at     TIMESTAMPTZ DEFAULT now(),
      unsubscribed_at   TIMESTAMPTZ
    );
  ELSE
    -- 기존 테이블에 새 컬럼 추가 (없는 경우만)
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS name TEXT;
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS gender TEXT;
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS mbti TEXT;
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS age_group TEXT;
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS unsubscribe_reason TEXT;
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0;
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ;
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;
  END IF;
END $$;

-- 3. episode_views 테이블
CREATE TABLE IF NOT EXISTS episode_views (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id  UUID REFERENCES episodes(id) ON DELETE CASCADE,
  viewer_ip   TEXT,
  user_agent  TEXT,
  referrer    TEXT,
  viewed_at   TIMESTAMPTZ DEFAULT now()
);

-- 4. votes 테이블
CREATE TABLE IF NOT EXISTS votes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id  UUID REFERENCES episodes(id) ON DELETE CASCADE,
  gender_vote TEXT NOT NULL CHECK (gender_vote IN ('female','male')),
  voter_ip    TEXT,
  mbti        TEXT,
  voted_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(episode_id, voter_ip)
);

-- 5. shares 테이블
CREATE TABLE IF NOT EXISTS shares (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id  UUID REFERENCES episodes(id) ON DELETE CASCADE,
  platform    TEXT NOT NULL CHECK (platform IN ('kakao','twitter','facebook','link','other')),
  shared_at   TIMESTAMPTZ DEFAULT now()
);

-- 6. mbti_reactions 테이블
CREATE TABLE IF NOT EXISTS mbti_reactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id  UUID REFERENCES episodes(id) ON DELETE CASCADE,
  mbti_type   TEXT NOT NULL CHECK (char_length(mbti_type) = 4),
  gender      TEXT NOT NULL CHECK (gender IN ('male','female')),
  reaction    TEXT NOT NULL,
  sensitivity INTEGER DEFAULT 5 CHECK (sensitivity BETWEEN 1 AND 10),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 7. newsletter_sends 테이블
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id    UUID REFERENCES episodes(id),
  total_sent    INTEGER DEFAULT 0,
  total_opened  INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  sent_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes(status);
CREATE INDEX IF NOT EXISTS idx_episodes_published_at ON episodes(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_episode_views_episode ON episode_views(episode_id);
CREATE INDEX IF NOT EXISTS idx_votes_episode ON votes(episode_id);
CREATE INDEX IF NOT EXISTS idx_shares_episode ON shares(episode_id);
CREATE INDEX IF NOT EXISTS idx_mbti_reactions_episode ON mbti_reactions(episode_id, mbti_type);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (published 에피소드만)
DROP POLICY IF EXISTS "episodes_public_read" ON episodes;
CREATE POLICY "episodes_public_read" ON episodes
  FOR SELECT USING (status = 'published');

-- 서비스 키로만 쓰기 허용 (API 라우트에서 service_role 사용)
DROP POLICY IF EXISTS "episodes_service_write" ON episodes;
CREATE POLICY "episodes_service_write" ON episodes
  FOR ALL USING (true) WITH CHECK (true);

-- episode_views: 누구나 조회 기록 삽입 가능
DROP POLICY IF EXISTS "views_insert" ON episode_views;
CREATE POLICY "views_insert" ON episode_views
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "views_read" ON episode_views;
CREATE POLICY "views_read" ON episode_views
  FOR SELECT USING (true);

-- votes: 누구나 투표 가능, 읽기 가능
DROP POLICY IF EXISTS "votes_insert" ON votes;
CREATE POLICY "votes_insert" ON votes
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "votes_read" ON votes;
CREATE POLICY "votes_read" ON votes
  FOR SELECT USING (true);

-- shares: 누구나 공유 기록 삽입 가능
DROP POLICY IF EXISTS "shares_insert" ON shares;
CREATE POLICY "shares_insert" ON shares
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "shares_read" ON shares;
CREATE POLICY "shares_read" ON shares
  FOR SELECT USING (true);

-- mbti_reactions: 공개 읽기
DROP POLICY IF EXISTS "mbti_read" ON mbti_reactions;
CREATE POLICY "mbti_read" ON mbti_reactions
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "mbti_service_write" ON mbti_reactions;
CREATE POLICY "mbti_service_write" ON mbti_reactions
  FOR ALL USING (true) WITH CHECK (true);

-- subscribers: 서비스 키만 접근
DROP POLICY IF EXISTS "subscribers_service" ON subscribers;
CREATE POLICY "subscribers_service" ON subscribers
  FOR ALL USING (true) WITH CHECK (true);

-- newsletter_sends: 서비스 키만 접근
DROP POLICY IF EXISTS "sends_service" ON newsletter_sends;
CREATE POLICY "sends_service" ON newsletter_sends
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 초기 데이터: sampleEpisodes 마이그레이션
-- ============================================================
INSERT INTO episodes (episode_number, title, hook, situation, female_text, female_thought, male_text, male_thought, resolution, advice, next_teaser, tags, status, published_at)
VALUES
(1,
 'Episode 1. "알았어" 들었을 때 정말 끝난 거 맞아?',
 '당신도 한 번쯤 그 "알았어" 듣고 이제 살았다며 안도한 적 있지 않으신가요?',
 '바쁜 주말 저녁, 약속 시간에 30분 늦은 남친. 약간의 언쟁 끝에 여친이 "알았어"라고 말하고 조수석 창밖만 바라보며 침묵한다. 남친은 화가 풀린 줄 알고 라디오 볼륨을 올린다.',
 '"알았어"는 상황을 이해했다는 게 아니야. 지금 내 감정을 정돈할 시간이 필요하니까 더 이상 변명하지 말고 기다려 달라는 신호지. 그런데 왜 갑자기 신나는 노래를 트는 걸까? 내 기분은 전혀 신경 안 쓰는 걸까?',
 '지금 라디오 틀 기분이야? 진짜 눈치 없다...',
 '휴, 다행히 화가 좀 풀린 모양이네. "알았어"라고 했으니 일단 이 주제는 넘어간 거겠지? 분위기 좀 살리려고 일부러 신나는 노래 틀었는데, 왜 표정이 더 안 좋아지는 것 같지... 또 내가 뭐 잘못했나?',
 '알았다고 했으면 끝난 거 아니었어? 분위기 띄우려고 했는데...',
 E'여성의 "알았어"는 종결이 아니라 리셋 버튼입니다.\n남자에게 필요한 건 5분의 침묵, 여자에게 필요한 건 그 침묵이 무시가 아니라는 확인입니다.\n근데... 그 5분 동안 라디오 볼륨은 내려두는 거야, 진짜로.',
 '여성은 침묵 대신 "지금은 화가 나서 정리가 필요해"라고 명확히 표현해 주세요. 남성은 "알았어" 직후에 바로 분위기를 전환하려 하지 말고 5분 정도 조용히 공감의 시간을 가지세요.',
 '다음 주 에피소드 예고: ''5분만 기다려'' — 그 5분이 50분이 되는 이유',
 ARRAY['의사소통', '침묵', '감정표현', '연애'],
 'published',
 now()
),
(2,
 'Episode 2. 오늘 밤 "아무거나"의 진짜 의미',
 '오늘 저녁 메뉴를 고민하다 화난 적 있나요? 사실 그건 메뉴 때문이 아니었을지도 모릅니다.',
 '금요일 저녁 데이트. 남친이 "오늘 뭐 먹을래?"라고 묻자 여친은 "아무거나"라고 답한다. 남친이 "그럼 삼겹살 어때?"라고 하자 여친은 "옷에 냄새 배는 건 좀..."이라며 말을 흐린다. "그럼 파스타?" "어제 점심에 먹었어."',
 '진짜로 아무거나 먹고 싶은 게 아니야. 내가 지금 어떤 기분인지, 이번 주에 얼마나 피곤했는지 고려해서 센스 있게 제안해 주길 바라는 거지. 매번 나보고 정하라고 하는 건 알아보기 귀찮다는 거 아닐까?',
 '우리 기념일도 얼마 안 남았는데, 좀 특별한 데 모의해둔 곳 없어?',
 '진짜 아무거나 괜찮다는 줄 알았어! 이것저것 제안해도 다 거절할 거면 차라리 처음부터 스시 먹고 싶다고 말해주면 안 되나? 메뉴 고르는 게 세상에서 제일 어려워. 스무고개 하는 기분이야.',
 '아까부터 네 번이나 퇴짜 맞았어... 그냥 네가 골라 제발 ㅠㅠ',
 '여성에게 "아무거나"는 메뉴 선택의 책임을 미루는 것이 아니라, 관계에 대한 관심과 센스를 테스트하는 은연중의 표현일 수 있습니다. 반면 남성에게는 효율성 떨어지는 불필요한 스무고개로 스트레스를 유발합니다.',
 '남성은 처음부터 3가지(분위기 좋은 곳 / 가벼운 곳 / 매콤한 것) 선택지를 주고 고르게 하세요. 여성은 완전한 "아무거나" 대신 "매운 거 빼고 아무거나"처럼 최소한의 가이드라인을 주세요.',
 NULL,
 ARRAY['의사소통', '데이트', '음식', '연애'],
 'published',
 now()
)
ON CONFLICT (episode_number) DO NOTHING;

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS episodes_updated_at ON episodes;
CREATE TRIGGER episodes_updated_at
  BEFORE UPDATE ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
