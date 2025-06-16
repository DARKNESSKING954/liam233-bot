// 🧠 chatgpt.js — OpenAI API wrapper

import fetch from 'node-fetch';

const OPENAI_API_KEY = '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'; // your real OpenAI API key

export async function askChatGPT(userMessage) {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
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