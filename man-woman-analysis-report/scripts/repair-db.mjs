import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing environment variables. Please check .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function repair() {
    console.log("🕵️ Checking DB schema...");

    // Test if image_url exists
    const { error: testError } = await supabase.from('tarot_cards').select('image_url').limit(1);

    if (testError && testError.message.includes('column "image_url" does not exist')) {
        console.error("❌ CRITICAL: 'image_url' column is missing in 'tarot_cards' table.");
        console.error("👉 Please run this SQL in Supabase Dashboard SQL Editor first:");
        console.error("   ALTER TABLE public.tarot_cards ADD COLUMN image_url TEXT;");
        return;
    }

    console.log("✅ Schema OK. Updating image URLs...");

    // Major Arcana (0-21)
    const updates = [];
    for (let i = 0; i <= 21; i++) {
        const url = `${supabaseUrl}/storage/v1/object/public/test_images/tarot_${i}.jpg`;
        updates.push(
            supabase.from('tarot_cards')
                .update({ image_url: url })
                .eq('card_number', i)
                .then(({ error }) => {
                    if (error) console.error(`  ❌ Failed to update card ${i}:`, error.message);
                    else console.log(`  ✅ Card ${i} linked to ${url}`);
                })
        );
    }

    await Promise.all(updates);
    console.log("✨ DB Repair Finished!");
}

repair();
