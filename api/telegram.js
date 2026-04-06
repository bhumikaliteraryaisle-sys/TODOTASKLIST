const bot = require('../src/bot');

module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            res.status(200).json({ ok: true });
        } else {
            res.status(200).send('Telegram Bot Webhook is running.');
        }
    } catch (e) {
        console.error('Error handling update', e);
        res.status(500).send('Error processing request.');
    }
};
