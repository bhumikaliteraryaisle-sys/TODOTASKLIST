const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

async function parseMessage(messageText) {
    if (!ai) {
        throw new Error('GenAI not initialized. GEMINI_API_KEY is missing.');
    }

    const systemPrompt = `You are an AI assistant for a To-Do bot. Parse the user's message and determine what action to take.
Return ONLY valid JSON with no markdown formatting.
Actions can be: "add", "complete", "delete", "remove_completed", "list".
For "add", extract "task" (string), "deadline" (string, optional like "today", "tomorrow"), "priority" (string: "low", "normal", "high").
For "complete" and "delete", extract "taskId" (integer).

Examples:
- "Remind me to buy milk tomorrow" -> {"action": "add", "task": "buy milk", "deadline": "tomorrow", "priority": "normal"}
- "Done with task 5" -> {"action": "complete", "taskId": 5}
- "Delete task 2" -> {"action": "delete", "taskId": 2}
- "Clear completed" -> {"action": "remove_completed"}
- "What do I have to do?" -> {"action": "list"}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\nUser message: "${messageText}"`,
        config: {
            responseMimeType: "application/json",
        }
    });

    const output = response.text;
    try {
        return JSON.parse(output);
    } catch (e) {
        console.error("Failed to parse JSON:", output);
        throw new Error("Invalid response format from AI");
    }
}

module.exports = { parseMessage };
