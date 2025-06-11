// utils.js

// Extract user ID from WhatsApp message
export function getUserId(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

// Format coin amount nicely
export function formatCoins(amount) {
  return `💰 ${amount} coins`;
}

// Simple sleep/delay function (ms milliseconds)
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}