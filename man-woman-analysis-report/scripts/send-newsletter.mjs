import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!supabaseUrl || !supabaseKey) {
  console.error('[SEND BOT] Missing Supabase credentials');
  process.exit(1);
}

if (!smtpHost || !smtpUser || !smtpPass) {
  console.error('[SEND BOT] Missing SMTP credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPass },
});

async function sendNewsletters() {
  console.log('[SEND BOT] Starting daily personalized dispatch queue...');

  try {
    // 1. 활성 구독자 조회 (다음에 받아야 할 번호와 함께)
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email, next_episode_to_send')
      .eq('status', 'active');

    if (subError || !subscribers || subscribers.length === 0) {
      console.log('[SEND BATCH] No active subscribers found.');
      process.exit(0);
    }

    // 2. 받아야 할 에피소드 번호별로 그룹핑
    const queue = {};
    subscribers.forEach(sub => {
      const epNum = sub.next_episode_to_send || 1;
      if (!queue[epNum]) queue[epNum] = [];
      queue[epNum].push(sub.email);
    });

    const results = [];
    const episodeNumbers = Object.keys(queue).map(Number);

    // 3. 각 그룹별 발송 프로세스
    for (const epNum of episodeNumbers) {
      const recipientEmails = queue[epNum];
      console.log(`[SEND BOT] Processing Episode ${epNum} for ${recipientEmails.length} recipients...`);

      // 해당 그룹이 받아야 할 에피소드 정보 조회
      const { data: episode, error: epError } = await supabase
        .from('episodes')
        .select('*')
        .eq('episode_number', epNum)
        .single();

      if (epError || !episode) {
        console.warn(`[SEND BOT] Episode ${epNum} not found in DB. Skipping this group.`);
        continue;
      }

      // Fallback for missing slug
      const episodeUrlId = episode.slug || episode.id;

      try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <div style="padding: 32px 32px 16px; text-align: center;">
      <div style="color: #6b7280; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px;">EPISODE ${episode.episode_number}</div>
      <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 24px; color: #111827;">📝 ${episode.title}</h1>
    </div>
    <div style="padding: 0 32px 32px;">
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="font-size: 13px; font-weight: 700; color: #6b7280; margin: 0 0 8px;">오늘의 상황</p>
        <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #1f2937;">${episode.situation}</p>
      </div>
      <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="margin-bottom: 12px;"><span style="font-size: 20px; margin-right: 8px;">👩</span><span style="font-size: 16px; font-weight: 700; color: #1f2937;">그녀의 솔직한 마음</span></div>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">${episode.female_text}</p>
        ${episode.female_thought ? `<p style="font-size: 14px; font-style: italic; color: #6b7280; text-align: center;">"${episode.female_thought}"</p>` : ''}
      </div>
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="margin-bottom: 12px;"><span style="font-size: 20px; margin-right: 8px;">👨</span><span style="font-size: 16px; font-weight: 700; color: #1f2937;">그의 현실적 사고</span></div>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">${episode.male_text}</p>
        ${episode.male_thought ? `<p style="font-size: 14px; font-style: italic; color: #6b7280; text-align: center;">"${episode.male_thought}"</p>` : ''}
      </div>
    </div>
    <div style="text-align: center; padding: 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">본격적인 해결책과 조언은 웹사이트에서 이어집니다.</p>
      <a href="https://man-woman-analysis-report.vercel.app/episodes/${episodeUrlId}" style="display: inline-block; background-color: #111827; color: #ffffff; font-weight: 500; font-size: 15px; text-decoration: none; padding: 12px 24px; border-radius: 6px;">남녀 심리 가이드 읽기</a>
      
      <!-- Coupang Partners Banner -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px dashed #e5e7eb;">
        <p style="font-size: 13px; color: #6b7280; margin-bottom: 12px; font-weight: 500;">🎁 이번 에피소드 맞춤 추천 선물</p>
        <a href="https://link.coupang.com/a/bA0Dk9" target="_blank" style="display: block; background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-decoration: none; transition: all 0.2s ease;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
            <div style="font-size: 24px;">🛍️</div>
            <div style="text-align: left;">
              <div style="color: #111827; font-weight: 700; font-size: 15px; margin-bottom: 4px;">센스있는 데이트/연애 선물 기획전</div>
              <div style="color: #ec4899; font-size: 13px; font-weight: 600;">쿠팡에서 인기 상품 확인하기 ↗</div>
            </div>
          </div>
        </a>
        <p style="font-size: 11px; color: #9ca3af; margin-top: 12px;">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
      </div>
      <div style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
        본 메일은 수신 동의를 하신 분들께 발송되는 뉴스레터입니다. 
        <br/>
        <a href="https://man-woman-analysis-report.vercel.app/unsubscribe" style="color: #9ca3af; text-decoration: underline;">수신거부</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

        await transporter.sendMail({
          from: `"남녀분석보고서" <${smtpUser}>`,
          bcc: recipientEmails,
          subject: `Episode ${episode.episode_number}. ${episode.title}`,
          html: emailHtml,
        });

        // 4. 발송 성공 후 구독자 진도 업데이트 (Next Episode + 1)
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({ next_episode_to_send: epNum + 1 })
          .in('email', recipientEmails);

        if (updateError) {
          console.error(`[SEND BOT] Failed to update progress for Episode ${epNum}:`, updateError);
        }

        results.push({ episode: epNum, count: recipientEmails.length, success: true });

      } catch (sendErr) {
        console.error(`[SEND BOT] Failed to send Episode ${epNum}:`, sendErr);
        results.push({ episode: epNum, count: recipientEmails.length, success: false, error: String(sendErr) });
      }
    }

    console.log('[SEND BOT] All groups processed. Summary:', results);
    process.exit(0);

  } catch (e) {
    console.error('[SEND BOT] Fatal Error:', e);
    process.exit(1);
  }
}

sendNewsletters();
