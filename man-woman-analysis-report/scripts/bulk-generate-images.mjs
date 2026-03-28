import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Buffer from 'buffer';
import fs from 'fs';

// Load env from project root
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const leonardoApiKey = process.env.LEONARDO_API_KEY;

if (!supabaseUrl || !supabaseKey || !leonardoApiKey) {
    console.error('❌ Missing environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LEONARDO_API_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateAndUpload(prompt, fileName) {
    console.log(`📡 Generating: ${fileName}...`);
    try {
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
                width: 768,
                height: 1152, // Changed to 2:3 ratio (Tarot card standard)
                num_images: 1,
                promptMagic: true
            })
        });

        if (!genResponse.ok) {
            throw new Error(`Leonardo API Error: ${await genResponse.text()}`);
        }

        const genData = await genResponse.ok ? await genResponse.json() : null;
        const generationId = genData?.sdGenerationJob?.generationId;

        if (!generationId) throw new Error("No generationId received");

        let imageUrl = null;
        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const pollResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                headers: { "accept": "application/json", "authorization": `Bearer ${leonardoApiKey}` }
            });
            if (pollResponse.ok) {
                const pollData = await pollResponse.json();
                const images = pollData.generations_by_pk?.generated_images;
                if (images && images.length > 0) {
                    imageUrl = images[0].url;
                    break;
                }
                console.log(`  ...polling ${i + 1} (${pollData.generations_by_pk?.status})`);
            }
        }

        if (!imageUrl) throw new Error("Timeout waiting for image");

        const imgResponse = await fetch(imageUrl);
        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
            .from('test_images')
            .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage.from('test_images').getPublicUrl(fileName);
        return publicUrl.publicUrl;
    } catch (err) {
        console.error(`❌ Error generating ${fileName}:`, err.message);
        return null;
    }
}

const TAROT_CARDS = [
    { num: 0, name: "The Fool" }, { num: 1, name: "The Magician" }, { num: 2, name: "The High Priestess" },
    { num: 3, name: "The Empress" }, { num: 4, name: "The Emperor" }, { num: 5, name: "The Hierophant" },
    { num: 6, name: "The Lovers" }, { num: 7, name: "The Chariot" }, { num: 8, name: "Strength" },
    { num: 9, name: "The Hermit" }, { num: 10, name: "Wheel of Fortune" }, { num: 11, name: "Justice" },
    { num: 12, name: "The Hanged Man" }, { num: 13, name: "Death" }, { num: 14, name: "Temperance" },
    { num: 15, name: "The Devil" }, { num: 16, name: "The Tower" }, { num: 17, name: "The Star" },
    { num: 18, name: "The Moon" }, { num: 19, name: "The Sun" }, { num: 20, name: "Judgement" },
    { num: 21, name: "The World" }
];

const MBTI_TYPES = [
    "ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP",
    "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ"
];

async function main() {
    console.log("🚀 Starting Bulk Image Generation...");

    // 1. Ensure Bucket Exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === 'test_images')) {
        console.log("📦 Creating 'test_images' bucket...");
        const { error } = await supabase.storage.createBucket('test_images', { public: true });
        if (error) {
            console.error("❌ Failed to create bucket. Please create 'test_images' bucket manually in Supabase Storage.");
            // Continue anyway, maybe it exists but listing failed
        }
    }
    // 2. Generate Tarot (Improved Prompt to fix cropping)
    for (const card of TAROT_CARDS) {
        const prompt = `Full body character design entirely within frame, modern luxury tarot card illustration of ${card.name}, showing complete borders, centered composition with ample headroom, minimalist flat vector art, gold foil accents, dreamlike pastel color palette, premium clean design, high detail, 8k resolution`;
        const url = await generateAndUpload(prompt, `tarot_${card.num}.jpg`);
        if (url) {
            await supabase.from('tarot_cards').update({ image_url: url }).eq('card_number', card.num);
            console.log(`✅ Tarot ${card.num} updated (New Prompt): ${url}`);
        }
    }

    /* MBTI Generation Skip - Already Completed */
    /*
    const mbtiMap = {};
    for (const type of MBTI_TYPES) {
        ...
    }
    */

    console.log("\n📦 Copy this MBTI Map to LoveMBTI.tsx results (or I will read it from the file):");
    const output = JSON.stringify(mbtiMap, null, 2);
    console.log(output);
    fs.writeFileSync('scripts/mbti-images.json', output);
    console.log("\n✨ All Done! Results saved to scripts/mbti-images.json");
}

main();
