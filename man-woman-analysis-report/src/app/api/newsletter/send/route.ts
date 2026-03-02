import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.error('[SEND API] Missing SMTP credentials set in .env.local');
        return NextResponse.json({ error: 'SMTP 환경변수(SMTP_HOST, SMTP_USER, SMTP_PASS)가 설정되지 않았습니다.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    const { episodeId } = await request.json();

    if (!episodeId) {
        return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 });
    }

    let supabase;
    try {
        supabase = getSupabaseService();
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }

    // 1. 에피소드 정보 조회
    const { data: episode, error: epError } = await supabase
        .from('episodes')
        .select('*')
        .eq('id', episodeId)
        .single();

    if (epError || !episode) {
        return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    // 2. 활성 구독자 조회
    const { data: subscribers, error: subError } = await supabase
        .from('subscribers')
        .select('email')
        .eq('status', 'active');

    if (subError || !subscribers || subscribers.length === 0) {
        return NextResponse.json({ error: 'No active subscribers' }, { status: 404 });
    }

    try {
        // 3. Nodemailer를 이용한 발송 (숨은 참조 bcc를 사용하여 수신자 프라이버시 보호)

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    
    <div style="padding: 32px 32px 16px; text-align: center;">
      <div style="color: #6b7280; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px;">EPISODE ${episode.episode_number}</div>
      <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 24px; color: #111827;">📝 ${episode.title}</h1>
    </div>
    
    <div style="padding: 0 32px 32px;">
      <!-- 상황 묘사 -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="font-size: 13px; font-weight: 700; color: #6b7280; margin: 0 0 8px;">오늘의 상황</p>
        <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #1f2937;">${episode.situation || '흥미진진한 오늘의 에피소드를 만나보세요.'}</p>
      </div>

      <!-- 여자 시점 -->
      <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="margin-bottom: 12px;">
          <span style="font-size: 20px; margin-right: 8px;">👩</span>
          <span style="font-size: 16px; font-weight: 700; margin: 0; color: #1f2937;">그녀의 솔직한 마음</span>
        </div>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #374151;">${episode.female_text || ''}</p>
        ${episode.female_thought ? `<p style="font-size: 14px; font-style: italic; color: #6b7280; text-align: center; margin: 0;">"${episode.female_thought}"</p>` : ''}
      </div>

      <!-- 남자 시점 -->
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="margin-bottom: 12px;">
          <span style="font-size: 20px; margin-right: 8px;">👨</span>
          <span style="font-size: 16px; font-weight: 700; margin: 0; color: #1f2937;">그의 현실적 사고</span>
        </div>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #374151;">${episode.male_text || ''}</p>
        ${episode.male_thought ? `<p style="font-size: 14px; font-style: italic; color: #6b7280; text-align: center; margin: 0;">"${episode.male_thought}"</p>` : ''}
      </div>
    </div>
    
    <div style="text-align: center; padding: 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">본격적인 해결책과 조언은 웹사이트에서 이어집니다.</p>
      <a href="https://man-woman-analysis-report.vercel.app/?episode=${episode.episode_number}" style="display: inline-block; background-color: #111827; color: #ffffff; font-weight: 500; font-size: 15px; text-decoration: none; padding: 12px 24px; border-radius: 6px;">자세한 내용 확인하기</a>
    </div>
  </div>
</body>
</html>
`;

        const mailOptions = {
            from: `"남녀분석보고서" <${smtpUser}>`,
            bcc: subscribers.map(s => s.email), // 여러 명에게 한 번에 보낼 때는 bcc(숨은 참조) 활용
            subject: `Episode ${episode.episode_number}. ${episode.title}`,
            html: emailHtml,
        };

        const info = await transporter.sendMail(mailOptions);

        // 4. 발송 완료 기록
        await supabase
            .from('episodes')
            .update({ sent_at: new Date().toISOString(), status: 'sent' })
            .eq('id', episodeId);

        console.log(`[SEND API] Successfully sent email for Episode ${episodeId}. Message ID: ${info.messageId}`);
        return NextResponse.json({ success: true, messageId: info.messageId });
    } catch (err: any) {
        console.error('[SEND API] Nodemailer/Supabase Exception:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
