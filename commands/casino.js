import { getWallet, addCoins, removeCoins } from '../memory.js';
import { getUserId } from '../utils.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatCoins(amount) {
  return `💰 ${amount} coins`;
}

// 🧠 In-memory cooldown tracker
const lastDailyClaim = {};

// 📅 Daily reward (in-memory cooldown)
async function daily(sock, msg) {
  const user = getUserId(msg);
  const from = msg.key.remoteJid;
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  if (lastDailyClaim[user] && now - lastDailyClaim[user] < DAY) {
    const timeLeft = DAY - (now - lastDailyClaim[user]);
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

    return sock.sendMessage(from, {
      text: `🕒 You've already claimed your daily reward.\nCome back in ${hours}h ${minutes}m.`,
    });
  }

  // Set cooldown in memory
  lastDailyClaim[user] = now;

  addCoins(user, 500);
  const newBalance = getWallet(user);

  await sock.sendMessage(from, {
    text: `🎁 You claimed 500 coins!\n💳 Wallet: ${formatCoins(newBalance)}`,
  });
}

// 💳 Check wallet
async function wallet(sock, msg) {
  const user = getUserId(msg);
  const from = msg.key.remoteJid;
  const coins = getWallet(user);

  await sock.sendMessage(from, {
    text: `💳 Your wallet: ${formatCoins(coins)}`,
  });
}

// 🐴 Horse game
async function horse(sock, msg, args) {
  const user = getUserId(msg);
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0 || isNaN(pick) || pick < 1 || pick > 5)
    return sock.sendMessage(from, {
      text: '❗ Usage: .horse <amount> <horse number (1-5)>',
    });

  const balance = getWallet(user);
  if (bet > balance)
    return sock.sendMessage(from, {
      text: `❌ Not enough coins. You have: ${formatCoins(balance)}`,
    });

  // 🎉 Hype build-up messages
  await sock.sendMessage(from, { text: '🏇 Horses are warming up!' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🐴 Stretching legs on the track...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '📢 Crowd is roaring! Place your bets!' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🏁 The race begins!' });
  await sleep(1000);

  const positions = [0, 0, 0, 0, 0];

  for (let i = 0; i < 20; i++) {
    const advance = Math.floor(Math.random() * 5);
    positions[advance]++;

    const raceVisual = positions
      .map((pos, idx) => '─'.repeat(pos) + `🏇 Horse ${idx + 1}`)
      .join('\n');

    await sock.sendMessage(from, { text: `📊 Race Progress:\n\n${raceVisual}` });
    await sleep(400);
  }

  const max = Math.max(...positions);
  const winners = positions
    .map((val, idx) => ({ pos: val, idx }))
    .filter(h => h.pos === max)
    .map(h => h.idx + 1);

  const winner = winners[Math.floor(Math.random() * winners.length)];

  await sock.sendMessage(from, {
    text: `🏁 The race is over! Winner: 🏇 Horse ${winner}`,
  });

  // 🎉 Post-race commentary
  await sock.sendMessage(from, { text: `🎤 What a finish! The crowd is going wild!` });
  await sleep(700);
  await sock.sendMessage(from, { text: `📦 Counting the coins...` });
  await sleep(700);
  await sock.sendMessage(from, { text: `📣 Let's reveal the result...` });

  if (pick === winner) {
    addCoins(user, bet * 2);
    await sock.sendMessage(from, {
      text: `🎉 You won ${formatCoins(bet * 2)}!`,
    });
  } else {
    removeCoins(user, bet);
    await sock.sendMessage(from, {
      text: `😢 You lost ${formatCoins(bet)}. Better luck next time!`,
    });
  }
}

export default {
  daily,
  wallet,
  horse,
};