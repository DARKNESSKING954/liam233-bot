// ✅ casino.js (inside /commands) - Uses correct imports and consistent ID
import { getWallet, addCoins, removeCoins } from '../coinStorage.js';

const dailyClaimed = new Map();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatCoins(amount) {
  return `💰 ${amount} coins`;
}

// 🎁 .daily
async function daily(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  const lastClaim = dailyClaimed.get(user);
  const now = Date.now();

  // 24-hour check
  if (lastClaim && now - lastClaim < 24 * 60 * 60 * 1000) {
    return sock.sendMessage(from, { text: '🕒 You already claimed your daily reward. Try again later.' });
  }

  const reward = 500;
  addCoins(user, reward);
  dailyClaimed.set(user, now);
  return sock.sendMessage(from, { text: `🎁 You claimed your daily reward of ${formatCoins(reward)}!` });
}

// 💳 .wallet
async function wallet(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const coins = getWallet(user);
  return sock.sendMessage(from, { text: `👛 Your wallet: ${formatCoins(coins)}` });
}

// 🐎 .horse <bet> <horse number>
async function horse(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0 || isNaN(pick) || pick < 1 || pick > 5) {
    return sock.sendMessage(from, { text: '❗ Usage: .horse <amount> <horse (1-5)>' });
  }

  const balance = getWallet(user);
  if (bet > balance) {
    return sock.sendMessage(from, { text: `❌ Not enough coins. Your balance: ${formatCoins(balance)}` });
  }

  // Start race
  await sock.sendMessage(from, { text: '🐎 The horses are lining up at the start line...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '📢 The crowd roars as the gates open!' });
  await sleep(1000);

  const positions = [0, 0, 0, 0, 0];
  for (let i = 0; i < 20; i++) {
    const advancingHorse = Math.floor(Math.random() * 5);
    positions[advancingHorse]++;

    const visuals = positions.map((pos, index) => {
      return '─'.repeat(pos) + `🏇 Horse ${index + 1}`;
    }).join('\n');

    await sock.sendMessage(from, { text: `🏁 Race Update:\n\n${visuals}` });
    await sleep(500);
  }

  const maxPosition = Math.max(...positions);
  const winners = positions
    .map((pos, index) => ({ pos, index }))
    .filter(h => h.pos === maxPosition)
    .map(h => h.index + 1);
  const winner = winners[Math.floor(Math.random() * winners.length)];

  await sock.sendMessage(from, { text: `🥇 Horse ${winner} crosses the finish line first!` });

  if (pick === winner) {
    addCoins(user, bet * 2);
    await sock.sendMessage(from, { text: `🎉 You picked Horse ${pick} and WON ${formatCoins(bet * 2)}!` });
  } else {
    removeCoins(user, bet);
    await sock.sendMessage(from, { text: `😢 Horse ${pick} didn't win. You lost ${formatCoins(bet)}.` });
  }
}

export default {
  daily,
  wallet,
  horse,
};
