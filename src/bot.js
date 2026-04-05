const { Telegraf } = require('telegraf');
const db = require('./db');
const ai = require('./ai');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || 'dummy_token');

bot.start((ctx) => {
    ctx.reply('Welcome to the Smart Telegram To-Do Manager! Send me a clear instruction like "remind me to buy groceries tomorrow" or "complete task 1".');
});

bot.command('today', async (ctx) => {
    try {
        const tasks = await db.getTasks(ctx.from.id.toString(), 'pending');
        if (tasks.length === 0) {
            return ctx.reply("You have no pending tasks. Great job!");
        }
        let reply = "Your pending tasks:\n";
        tasks.forEach(t => {
            reply += `[${t.id}] ${t.task} (Priority: ${t.priority}, Deadline: ${t.deadline || 'None'})\n`;
        });
        ctx.reply(reply);
    } catch (e) {
        ctx.reply('Error fetching tasks.');
    }
});

bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return; // ignore other cmds

    try {
        const userId = ctx.from.id.toString();
        const actionData = await ai.parseMessage(ctx.message.text);
        
        switch (actionData.action) {
            case 'add':
                const newTask = await db.addTask(userId, actionData.task, actionData.deadline, actionData.priority);
                ctx.reply(`Added: [${newTask.id}] ${newTask.task} (Priority: ${newTask.priority})`);
                break;
            case 'complete':
                if (!actionData.taskId) return ctx.reply('Please specify a task ID.');
                const compCount = await db.completeTask(userId, actionData.taskId);
                if (compCount > 0) ctx.reply(`Task ${actionData.taskId} marked as completed!`);
                else ctx.reply(`Task ${actionData.taskId} not found or already completed.`);
                break;
            case 'delete':
                if (!actionData.taskId) return ctx.reply('Please specify a task ID.');
                const delCount = await db.deleteTask(userId, actionData.taskId);
                if (delCount > 0) ctx.reply(`Task ${actionData.taskId} deleted.`);
                else ctx.reply(`Task ${actionData.taskId} not found.`);
                break;
            case 'remove_completed':
                const remCount = await db.removeCompleted(userId);
                ctx.reply(`Removed ${remCount} completed tasks.`);
                break;
            case 'list':
                const tasks = await db.getTasks(userId, 'pending');
                if (tasks.length === 0) {
                    ctx.reply("You have no pending tasks.");
                } else {
                    let reply = "Your pending tasks:\n";
                    tasks.forEach(t => {
                        reply += `[${t.id}] ${t.task} (Priority: ${t.priority}, Deadline: ${t.deadline || 'None'})\n`;
                    });
                    ctx.reply(reply);
                }
                break;
            default:
                ctx.reply("I didn't quite understand that action.");
        }
    } catch (error) {
        console.error(error);
        if (error.message.includes('GenAI not initialized')) {
             ctx.reply('The bot is missing its Gemini API key. Please contact the administrator.');
        } else {
             ctx.reply('Sorry, I encountered an error processing your request.');
        }
    }
});

module.exports = bot;
