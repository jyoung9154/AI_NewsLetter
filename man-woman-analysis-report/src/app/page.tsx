import { getSupabaseService } from '@/lib/supabase';
import { HomeContent } from '@/components/home/HomeContent';

export default async function Home() {
  const supabase = getSupabaseService();
  const { data: episodes } = await supabase
    .from('episodes')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return <HomeContent episodes={episodes || []} />;
}
