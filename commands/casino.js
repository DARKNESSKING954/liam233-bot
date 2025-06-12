import { getWallet, addCoins, removeCoins, getLastDaily, setLastDaily } from '../memory.js';
import { getUserId } from '../utils.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatCoins(amount) {
  return `💰 ${amount} coins`;
}

function getTodayDateStr() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// 📅 Daily command with calendar-based cooldown
async function daily(sock, msg) {
  const user = getUserId(msg);
  const from = msg.key.remoteJid;

  const today = getTodayDateStr();
  const lastDate = getLastDaily(user);

  if (today === lastDate) {
    return sock.sendMessage(from, {
      text: `🕒 You've already claimed your daily reward today.\nCome back tomorrow!`
    });
  }

  addCoins(user, 500);
  setLastDaily(user, today);

  const newBalance = getWallet(user);
  await sock.sendMessage(from, {
    text: `🎁 You claimed 500 coins! Your wallet: ${formatCoins(newBalance)}`
  });
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

  const hypeMessages = [
    '🎺 Trumpets blare! The horses are making their way to the starting line...',
    '🐎 The crowd is roaring as the horses trot into position!',
    '🎉 Welcome to today’s high-stakes race! Place your final bets!',
    '🥁 The drum rolls begin... it’s almost time for action!'
  ];

  const postRaceMessages = [
    '📣 That was an intense race!',
    '🔥 The energy in the crowd is electric!',
    '👏 What a finish! The fans are going wild!'
  ];

  await sock.sendMessage(from, { text: hypeMessages[Math.floor(Math.random() * hypeMessages.length)] });
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
  await sleep(500);
  await sock.sendMessage(from, { text: postRaceMessages[Math.floor(Math.random() * postRaceMessages.length)] });

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