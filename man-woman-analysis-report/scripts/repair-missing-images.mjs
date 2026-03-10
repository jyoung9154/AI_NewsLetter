import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import Buffer from 'buffer';

// Load env
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const leonardoApiKey = process.env.LEONARDO_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing essential Supabase environment variables');
    // Don't exit(1) if imported, just log error
}

const openai = new OpenAI({
    apiKey: geminiApiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const supabase = createClient(supabaseUrl, supabaseKey);

export async function repairImages() {
    console.log('🔍 Searching for episodes missing images...');

    const { data: episodes, error } = await supabase
        .from('episodes')
        .select('id, episode_number, title, situation, slug, image_url')
        .or('image_url.is.null,image_url.eq.""')
        .order('episode_number', { ascending: false });

    if (error) {
        console.error('❌ Error fetching episodes:', error);
        return;
    }

    if (!episodes || episodes.length === 0) {
        console.log('✅ No episodes missing images found.');
        return;
    }

    console.log(`🚀 Found ${episodes.length} episodes missing images. Starting repair...`);

    for (const episode of episodes) {
        console.log(`\n[Episode ${episode.episode_number}] ${episode.title}`);

        try {
            // 1. Generate Image Prompt in English using episode.slug (Avoiding API calls due to 429)
            // Slug is already in English and describes the situation well for AI.
            const cleanSlug = episode.slug ? episode.slug.replace(/-/g, ' ') : 'romantic relationship conflict';
            const prompt = `A professional minimalist flat vector illustration capturing the concept of '${cleanSlug}'. Two characters (a man and a woman) in a subtle emotional conflict, modern setting. Simple shapes, solid pastel background, clean design, trendy aesthetics, high resolution, center-aligned.`;
            console.log(`🎨 Final English Prompt (Slug-based): ${prompt}`);

            let imageBuffer = null;
            console.log(`📡 Calling Leonardo.ai API...`);

            // 1. Start generation
            const genResponse = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
                method: 'POST',
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "authorization": `Bearer ${leonardoApiKey}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    modelId: "291be633-cb24-434f-898f-e662799936ad", // Leonardo Signature
                    width: 512,
                    height: 512,
                    num_images: 1,
                    promptMagic: true
                })
            });

            if (genResponse.ok) {
                const genData = await genResponse.ok ? await genResponse.json() : null;
                const generationId = genData?.sdGenerationJob?.generationId;

                if (generationId) {
                    console.log(`[REPAIR] Leonardo Job ID: ${generationId}. Polling for result...`);

                    let imageUrl = null;
                    for (let i = 0; i < 15; i++) { // Max 30 seconds
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        const pollResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                            headers: {
                                "accept": "application/json",
                                "authorization": `Bearer ${leonardoApiKey}`
                            }
                        });

                        if (pollResponse.ok) {
                            const pollData = await pollResponse.json();
                            const images = pollData.generations_by_pk?.generated_images;
                            if (images && images.length > 0) {
                                imageUrl = images[0].url;
                                break;
                            }
                            console.log(`[REPAIR] Polling Leonardo ${i + 1}... (Status: ${pollData.generations_by_pk?.status})`);
                        }
                    }

                    if (imageUrl) {
                        console.log(`[REPAIR] Leonardo Image URL: ${imageUrl}. Downloading...`);
                        const imgResponse = await fetch(imageUrl);
                        if (imgResponse.ok) {
                            const arrayBuffer = await imgResponse.arrayBuffer();
                            imageBuffer = Buffer.from(arrayBuffer);
                            console.log('[REPAIR] Leonardo image downloaded successfully.');
                        }
                    } else {
                        console.warn('[REPAIR] Leonardo generation timed out or failed.');
                    }
                }
            } else {
                const errorText = await genResponse.text();
                console.warn(`[REPAIR] Leonardo API Error (${genResponse.status}):`, errorText);
            }

            // --- FALLBACK: Hugging Face Inference API ---
            const hfApiToken = process.env.HF_API_TOKEN;
            if (!imageBuffer && hfApiToken) {
                console.log(`[REPAIR] Attempting Fallback: Generating image via Hugging Face...`);
                try {
                    const hfResponse = await fetch(
                        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
                        {
                            headers: {
                                "Authorization": `Bearer ${hfApiToken}`,
                                "Content-Type": "application/json",
                            },
                            method: "POST",
                            body: JSON.stringify({
                                inputs: prompt,
                                options: { wait_for_model: true }
                            }),
                        }
                    );

                    if (hfResponse.ok) {
                        const arrayBuffer = await hfResponse.arrayBuffer();
                        imageBuffer = Buffer.from(arrayBuffer);
                        console.log('[REPAIR] Hugging Face image generated successfully.');
                    } else {
                        const hfErrorText = await hfResponse.text();
                        console.warn(`[REPAIR] Hugging Face API Error (${hfResponse.status}):`, hfErrorText);
                    }
                } catch (hfError) {
                    console.error('[REPAIR] Error during Hugging Face call:', hfError);
                }
            }

            if (!imageBuffer) continue;

            // 3. Upload to Supabase Storage
            const fileName = `episode_${episode.episode_number}_repair_${Date.now()}.jpg`;
            console.log(`📤 Uploading to Storage: episode_images/${fileName}...`);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('episode_images')
                .upload(fileName, imageBuffer, {
                    contentType: 'image/jpeg',
                    upsert: false
                });

            if (uploadError) {
                console.error('❌ Storage Upload failed:', uploadError);
                continue;
            }

            const { data: publicUrlData } = supabase.storage
                .from('episode_images')
                .getPublicUrl(uploadData.path);

            const finalImageUrl = publicUrlData.publicUrl;
            console.log(`✅ Image URL: ${finalImageUrl}`);

            // 4. Update Database
            const { error: updateError } = await supabase
                .from('episodes')
                .update({ image_url: finalImageUrl })
                .eq('id', episode.id);

            if (updateError) {
                console.error('❌ Database Update failed:', updateError);
            } else {
                console.log('🎉 Successfully repaired!');
            }

        } catch (err) {
            console.error(`❌ Unexpected error for Episode ${episode.episode_number}:`, err);
        }
    }
}

// Only run if called directly
// repairImages(); 
