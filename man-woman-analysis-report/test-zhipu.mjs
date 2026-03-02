import OpenAI from "openai";
import fs from "fs";

const env = fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(line => line.includes('ZAI_API_KEY'))[0]
    .split('=')[1]
    .trim();

console.log("Testing Zhipu AI connection via OpenAI Client...");
console.log("API Key length:", env.length);

const zhipuClient = new OpenAI({
    baseURL: "https://open.bigmodel.cn/api/paas/v4/",
    apiKey: env,
});

async function test() {
    const startTime = Date.now();
    try {
        const response = await zhipuClient.chat.completions.create({
            model: "glm-4.5-flash",
            messages: [{ role: "user", content: "Hello" }]
        });
        console.log("Success! Time taken:", Date.now() - startTime, "ms");
        console.log("Response:", response.choices[0].message.content);
    } catch (e) {
        console.error("Error connecting to Zhipu:", e);
    }
}
test();
