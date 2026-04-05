const express = require('express');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    try {
        const tasksQuery = await new Promise((resolve, reject) => {
            db.db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Basic aesthetic UI matching guidelines
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Smart To-Do Admin Dashboard</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg-color: #0f172a;
                    --text-color: #f8fafc;
                    --card-bg: #1e293b;
                    --accent-color: #3b82f6;
                    --completed-color: #10b981;
                    --pending-color: #f59e0b;
                    --border-color: #334155;
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                    width: 100%;
                    box-sizing: border-box;
                }
                header {
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-color);
                }
                h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0;
                    background: linear-gradient(to right, #60a5fa, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .card {
                    background-color: var(--card-bg);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    border: 1px solid var(--border-color);
                    position: relative;
                    overflow: hidden;
                }
                .card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
                }
                .task-id {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin-bottom: 0.5rem;
                }
                .task-content {
                    font-size: 1.1rem;
                    font-weight: 500;
                    margin-bottom: 1rem;
                    line-height: 1.4;
                }
                .badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .status-pending { background-color: rgba(245, 158, 11, 0.2); color: var(--pending-color); }
                .status-completed { background-color: rgba(16, 185, 129, 0.2); color: var(--completed-color); }
                .priority-high { border-left: 4px solid #ef4444; }
                .priority-normal { border-left: 4px solid #3b82f6; }
                .priority-low { border-left: 4px solid #64748b; }
                
                .meta-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1rem;
                    font-size: 0.85rem;
                    color: #cbd5e1;
                }
                .empty-state {
                    text-align: center;
                    padding: 4rem;
                    color: #94a3b8;
                    grid-column: 1 / -1;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>Smart To-Do Admin</h1>
                    <p style="color: #94a3b8; margin-top: 0.5rem;">Managing tasks dynamically via Telegram</p>
                </header>
                <div class="grid">
                    ${tasksQuery.length === 0 ? '<div class="empty-state"><h2>No tasks found.</h2><p>Wait for users to interact with the Telegram bot.</p></div>' : tasksQuery.map(task => `
                        <div class="card priority-${task.priority.toLowerCase()}">
                            <div class="task-id">ID: ${task.id} | User: ${task.user_id}</div>
                            <div class="task-content">${task.task}</div>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <span class="badge status-${task.status}">${task.status}</span>
                                ${task.deadline ? `<span class="badge" style="background: rgba(148, 163, 184, 0.2); color: #cbd5e1;">⏱ ${task.deadline}</span>` : ''}
                            </div>
                            <div class="meta-info">
                                <span>Priority: <strong>${task.priority}</strong></span>
                                <span>${new Date(task.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
        `;
        
        res.send(html);
    } catch (err) {
        res.status(500).send('Error fetching tasks from database.');
    }
});

function startServer() {
    app.listen(PORT, () => {
        console.log(`Admin Dashboard running on http://localhost:${PORT}`);
    });
}

module.exports = { startServer };
