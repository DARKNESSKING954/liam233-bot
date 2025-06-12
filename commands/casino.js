import { getWallet, addCoins, removeCoins } from '../memory.js';
import { getUserId } from '../utils.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatCoins(amount) {
  return `💰 ${amount} coins`;
}

// 📅 Daily claim limiter
const dailyClaimed = new Map();

async function daily(sock, msg) {
  const user = getUserId(msg);
  const from = msg.key.remoteJid;

  const last = dailyClaimed.get(user);
  const now = Date.now();

  if (last && now - last < 24 * 60 * 60 * 1000) {
    return sock.sendMessage(from, { text: '🕒 You already claimed your daily reward. Try again later.' });
  }

  addCoins(user, 500);
  dailyClaimed.set(user, now);
  await sock.sendMessage(from, { text: `🎁 You claimed 500 coins! Your wallet: ${formatCoins(getWallet(user))}` });
}

// 💳 Check wallet
async function wallet(sock, msg) {
  const user = getUserId(msg);
  const from = msg.key.remoteJid;
  const coins = getWallet(user);

  await sock.sendMessage(from, { text: `💳 Your wallet: ${formatCoins(coins)}` });
}

// 🐴 Horse game
async function horse(sock, msg, args) {
  const user = getUserId(msg);
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0 || isNaN(pick) || pick < 1 || pick > 5)
    return sock.sendMessage(from, { text: '❗ Usage: .horse <amount> <horse number (1-5)>' });

  const balance = getWallet(user);
  if (bet > balance)
    return sock.sendMessage(from, { text: `❌ Not enough coins. You have: ${formatCoins(balance)}` });

  await sock.sendMessage(from, { text: '🐎 The horses are lining up...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🏁 The race begins!' });
  await sleep(1000);

  const positions = [0, 0, 0, 0, 0];

  for (let i = 0; i < 20; i++) {
    const advance = Math.floor(Math.random() * 5);
    positions[advance]++;

    const raceVisual = positions.map((pos, idx) => {
      return '─'.repeat(pos) + `🏇 Horse ${idx + 1}`;
    }).join('\n');

    await sock.sendMessage(from, { text: `📊 Race Progress:\n\n${raceVisual}` });
    await sleep(400);
  }

  const max = Math.max(...positions);
  const winners = positions
    .map((val, idx) => ({ pos: val, idx }))
    .filter(h => h.pos === max)
    .map(h => h.idx + 1);

  const winner = winners[Math.floor(Math.random() * winners.length)];

  await sock.sendMessage(from, { text: `🏁 Winner: Horse ${winner}` });

  if (pick === winner) {
    addCoins(user, bet * 2);
    await sock.sendMessage(from, { text: `🎉 You won ${formatCoins(bet * 2)}!` });
  } else {
    removeCoins(user, bet);
    await sock.sendMessage(from, { text: `😢 You lost ${formatCoins(bet)}.` });
  }
}

export default {
  daily,
  wallet,
  horse,
};
