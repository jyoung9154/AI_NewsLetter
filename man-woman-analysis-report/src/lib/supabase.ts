import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 측 작업(발송 등)을 위한 서비스 롤 클라이언트
export const getSupabaseService = () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!serviceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
    }
    return createClient(supabaseUrl, serviceKey);
};
