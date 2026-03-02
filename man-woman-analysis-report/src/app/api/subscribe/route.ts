import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

import nodemailer from 'nodemailer';

// Helper for welcome email
async function sendWelcomeEmail(email: string, episodeNum: number) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP credentials not found, skipping welcome email');
        return;
    }

    const { data: episode } = await supabase
        .from('episodes')
        .select('*')
        .eq('episode_number', episodeNum)
        .single();

    if (!episode) return;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: (process.env.SMTP_PORT || '465') === '465',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const episodeUrlId = episode.slug || episode.id;
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <div style="padding: 32px; text-align: center; background-color: #fdf2f8; border-bottom: 1px solid #fbcfe8;">
      <h2 style="margin: 0; color: #db2777;">🎉 화성 남자와 금성 여자의 번역기</h2>
      <p style="margin: 8px 0 0; color: #be185d;">구독을 환영합니다! 첫 번째 이야기를 바로 보내드려요.</p>
    </div>
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
        <p style="font-size: 13px; color: #6b7280; margin-bottom: 12px; font-weight: 500;">🎁 이번 주 에피소드 맞춤 추천 선물</p>
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
    </div>
  </div>
</body>
</html>
`;

    try {
        await transporter.sendMail({
            from: `"남녀분석보고서" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `[웰컴 뉴스레터] Episode ${episode.episode_number}. ${episode.title}`,
            html: emailHtml,
        });

        // Update subscriber to progress to the next episode since we just sent one
        await supabase
            .from('subscribers')
            .update({ next_episode_to_send: episodeNum + 1 })
            .eq('email', email);
    } catch (e) {
        console.error('Failed to send welcome email:', e);
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const { email, my_gender, mbti, interested_mbti, age_group, start_option, specific_episode } = body;

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. 다음에 보낼 에피소드 번호 계산
    let nextEpisodeToSend = 1;
    if (start_option === 'latest' || !start_option) {
        const { data: maxEp } = await supabase
            .from('episodes')
            .select('episode_number')
            .order('episode_number', { ascending: false })
            .limit(1)
            .single();

        nextEpisodeToSend = (maxEp?.episode_number || 0); // Welcome mail sends this, next cron sends +1
    } else if (start_option === 'specific' && specific_episode) {
        nextEpisodeToSend = specific_episode;
    }

    const { data: existingUser } = await supabase
        .from('subscribers')
        .select('id, next_episode_to_send')
        .eq('email', email)
        .single();

    if (existingUser) {
        // 이미 존재하는 유저면 업데이트
        const updates: any = {};
        if (my_gender) updates.gender = my_gender;
        if (mbti) updates.mbti = mbti;
        if (interested_mbti) updates.interested_mbti = interested_mbti;
        if (age_group) updates.age_group = age_group;
        if (start_option) updates.start_option = start_option;
        // Don't override next_episode_to_send arbitrarily if updating profile info, unless specific option chosen
        if (start_option === 'specific' && specific_episode) {
            updates.next_episode_to_send = nextEpisodeToSend;
        } else if (start_option === 'first') {
            updates.next_episode_to_send = 1;
        }

        updates.status = 'active';

        const { error: updateError } = await supabase
            .from('subscribers')
            .update(updates)
            .eq('email', email);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // If it's a first time subscribe flow disguised as an update (some users double click) 
        // Or if they explicitly asked for a specific episode start, we can trigger an email, 
        // But to avoid spam, we'll only send a welcome email on true INSERT.
        return NextResponse.json({ message: 'Subscriber updated successfully', data: { email } }, { status: 200 });
    }

    // 신규 구독
    const { data, error } = await supabase
        .from('subscribers')
        .insert([{
            email,
            gender: my_gender || null,
            gender_preference: 'both',
            mbti: mbti || null,
            interested_mbti: interested_mbti || null,
            age_group: age_group || null,
            status: 'active',
            start_option: start_option || 'latest',
            next_episode_to_send: nextEpisodeToSend,
            subscribed_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 신규 구독자에게 즉시 웰컴 이메일 발송! (비동기 처리로 응답 지연 최소화 - Vercel에서는 비동기가 끊길 수 있으므로 await. 단 maxDuration 고려)
    await sendWelcomeEmail(email, nextEpisodeToSend);

    return NextResponse.json({ message: 'Subscribed successfully', data }, { status: 201 });
}

export async function GET() {
    const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('status', 'active');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
