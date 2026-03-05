import { getSupabaseService } from '@/lib/supabase';
import { HomeContent } from '@/components/home/HomeContent';

// ISR (Incremental Static Regeneration) 설정
// 60초마다 딱 한 번씩만 백그라운드에서 Supabase DB를 조회하고
// 모든 접속자에게는 캐싱된 번개같은 HTML 화면을 밀리초 단위로 쏴줍니다.
export const revalidate = 60;

export default async function Home() {
  const supabase = getSupabaseService();
  const { data: episodes } = await supabase
    .from('episodes')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return <HomeContent episodes={episodes || []} />;
}
