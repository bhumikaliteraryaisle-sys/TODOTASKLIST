const { sql } = require('@vercel/postgres');

// Ensure table exists on startup. Vercel Postgres uses PostgreSQL syntax.
async function initDb() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                task TEXT NOT NULL,
                deadline TEXT,
                priority TEXT DEFAULT 'normal',
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log("Database initialized.");
    } catch (e) {
        console.error('Error creating table', e);
    }
}

// Automatically try initializing when the module loads
initDb();

async function addTask(userId, task, deadline, priority) {
    try {
        const res = await sql`
            INSERT INTO tasks (user_id, task, deadline, priority) 
            VALUES (${userId}, ${task}, ${deadline}, ${priority || 'normal'}) 
            RETURNING *
        `;
        return res.rows[0];
    } catch (err) {
        throw err;
    }
}

async function getTasks(userId, status = 'pending') {
    try {
        if (status) {
            const res = await sql`SELECT * FROM tasks WHERE user_id = ${userId} AND status = ${status}`;
            return res.rows;
        } else {
            const res = await sql`SELECT * FROM tasks WHERE user_id = ${userId}`;
            return res.rows;
        }
    } catch (err) {
        throw err;
    }
}

async function getAllPendingTasks() {
    try {
        const res = await sql`SELECT * FROM tasks WHERE status = 'pending'`;
        return res.rows;
    } catch (err) {
        throw err;
    }
}

async function completeTask(userId, taskId) {
    try {
        const res = await sql`UPDATE tasks SET status = 'completed' WHERE id = ${taskId} AND user_id = ${userId}`;
        // Since Vercel DB is postgres, res.rowCount contains the number of affected rows
        return res.rowCount;
    } catch (err) {
        throw err;
    }
}

async function deleteTask(userId, taskId) {
    try {
        const res = await sql`DELETE FROM tasks WHERE id = ${taskId} AND user_id = ${userId}`;
        return res.rowCount;
    } catch (err) {
        throw err;
    }
}

async function removeCompleted(userId) {
    try {
        const res = await sql`DELETE FROM tasks WHERE user_id = ${userId} AND status = 'completed'`;
        return res.rowCount;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    initDb,
    addTask,
    getTasks,
    getAllPendingTasks,
    completeTask,
    deleteTask,
    removeCompleted
};
