import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Absolute project path
const PROJECT_ROOT = '/Users/jaeyoung/.openclaw/workspace/man-woman-analysis-report';

// Manual env loading since dotenv might not be in the execution context
function loadEnv() {
    try {
        const envPath = resolve(PROJECT_ROOT, '.env.local');
        const content = readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length === 2) {
                env[parts[0].trim()] = parts[1].trim();
            }
        });
        return env;
    } catch (e) {
        console.error('Failed to read .env.local:', e.message);
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. URL:', !!supabaseUrl, 'Key:', !!supabaseKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSlugSupport() {
    console.log('Fetching all episodes to backfill slugs...');

    const { data: episodes, error } = await supabase
        .from('episodes')
        .select('id, title, episode_number')
        .is('slug', null);

    if (error) {
        console.error('Error fetching episodes:', error);
        return;
    }

    console.log(`Found ${episodes?.length || 0} episodes needing slugs.`);

    for (const ep of episodes || []) {
        // Generate a simple slug from title or just use a generic one
        const simpleSlug = `episode-${ep.episode_number || ep.id.substring(0, 8)}`;

        const { error: updateError } = await supabase
            .from('episodes')
            .update({ slug: simpleSlug })
            .eq('id', ep.id);

        if (updateError) {
            console.error(`Failed to update slug for episode ${ep.id}:`, updateError);
        } else {
            console.log(`Updated slug for episode ${ep.episode_number}: ${simpleSlug}`);
        }
    }

    console.log('Finished updating slugs.');
}

addSlugSupport().catch(console.error);
