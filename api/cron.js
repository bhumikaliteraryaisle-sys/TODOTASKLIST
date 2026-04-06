const db = require('../src/db');
const bot = require('../src/bot');

module.exports = async (req, res) => {
    // Verify request is from Vercel Cron
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Running daily task summary job...');
    try {
        const allTasks = await db.getAllPendingTasks();
        if (!allTasks || allTasks.length === 0) return res.status(200).send('No tasks to summarize.');

        const userTasks = {};
        allTasks.forEach(task => {
            if (!userTasks[task.user_id]) userTasks[task.user_id] = [];
            userTasks[task.user_id].push(task);
        });

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
