const cron = require('node-cron');
const db = require('./db');
const bot = require('./bot');

function startScheduler() {
    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily task summary job...');
        try {
            const allTasks = await db.getAllPendingTasks();
            if(!allTasks || allTasks.length === 0) return;

            // Group tasks by user_id
            const userTasks = {};
            allTasks.forEach(task => {
                if (!userTasks[task.user_id]) {
                    userTasks[task.user_id] = [];
                }
                userTasks[task.user_id].push(task);
            });

            // Send summary to each user
            for (const [userId, tasks] of Object.entries(userTasks)) {
                let message = "🌅 Good morning! Here are your pending tasks for today:\n\n";
                tasks.forEach(t => {
                    message += `[${t.id}] ${t.task} (Priority: ${t.priority}, Deadline: ${t.deadline || 'None'})\n`;
                });
                
                try {
                    await bot.telegram.sendMessage(userId, message);
                } catch (sendError) {
                    console.error(`Failed to send summary to user ${userId}:`, sendError.message);
                }
            }
        } catch (err) {
            console.error('Error during daily cron schedule:', err);
        }
    });

    console.log('Scheduler initialized.');
}

module.exports = { startScheduler };
