import { getSupabaseService } from './src/lib/supabase.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const supabase = getSupabaseService();
    const { data, error } = await supabase.from('tarot_cards').select('card_number, name_en, name_ko').order('card_number');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

main();
