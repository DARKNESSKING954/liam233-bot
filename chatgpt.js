// 🧠 chatgpt.js — OpenAI API wrapper using .env

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config(); // Load variables from .env

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID;

export async function askChatGPT(userMessage) {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Project': OPENAI_PROJECT_ID
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful WhatsApp chatbot.' },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${error}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    return reply || '⚠️ No reply from ChatGPT.';
  } catch (err) {
    console.error('❌ ChatGPT API error:', err);
    return '⚠️ Failed to contact ChatGPT.';
  }
}