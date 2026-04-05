const db = require('../src/db');
const bot = require('../src/bot');

module.exports = async (req, res) => {
    // This endpoint should be triggered by Vercel Cron.
    console.log('Running daily task summary job...');
    try {
        const allTasks = await db.getAllPendingTasks();
        if(!allTasks || allTasks.length === 0) return res.status(200).send('No tasks to summarize.');

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
        res.status(200).send('Daily summary sent to all users.');
    } catch (err) {
        console.error('Error during daily cron schedule:', err);
        res.status(500).send('Internal Server Error');
    }
};
