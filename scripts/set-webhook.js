require('dotenv').config();
const { Telegraf } = require('telegraf');

const token = process.env.TELEGRAM_BOT_TOKEN;
const url = process.argv[2] || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

if (!token) {
    console.error('Error: TELEGRAM_BOT_TOKEN is missing in .env');
    process.exit(1);
}

if (!url) {
    console.error('Error: Webhook URL is required. Pass it as an argument or set VERCEL_PROJECT_PRODUCTION_URL in .env');
    console.error('Usage: npm run set-webhook <your-vercel-url>');
    process.exit(1);
}

const bot = new Telegraf(token);
// Ensure URL starts with https://
const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
const webhookPath = `${formattedUrl}/api/telegram`;

bot.telegram.setWebhook(webhookPath)
    .then((result) => {
        if (result) {
            console.log(`✅ Webhook successfully set to ${webhookPath}`);
        } else {
            console.log('❌ Failed to set webhook');
        }
    })
    .catch((error) => {
        console.error('❌ Error setting webhook:', error);
    });
