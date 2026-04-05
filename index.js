require('dotenv').config();

const bot = require('./src/bot');
const server = require('./src/server');
const scheduler = require('./src/scheduler');

async function main() {
    // 1. Check for basic API config
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.warn("⚠️ TELEGRAM_BOT_TOKEN is missing! Bot won't run correctly.");
    }
    
    // 2. Start Admin UI Server
    server.startServer();

    // 3. Start Scheduler for daily summaries
    scheduler.startScheduler();

    // 4. Start Telegram Bot
    if (process.env.TELEGRAM_BOT_TOKEN) {
        console.log("Starting Telegram Bot...");
        // Launch bot
        bot.launch().then(() => {
            console.log("Bot successfully launched!");
        }).catch(err => {
            console.error("Failed to launch bot:", err);
        });

        // Enable graceful stop
        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
    } else {
        console.log("Telegram bot starting sequence skipped (no token). Dashboard is running.");
    }
}

main();
