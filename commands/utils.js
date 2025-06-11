// utils.js

export function getUserId(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

export function formatCoins(amount) {
  return `💰 ${amount} coins`;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}