import { getWallet, addCoins, removeCoins } from './coinStorage.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatCoins(amount) {
  return `💰 ${amount} coins`;
}

// 🐴 .horse <amount> <horseNumber>
async function horse(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0 || isNaN(pick) || pick < 1 || pick > 5)
    return sock.sendMessage(from, { text: '❗ Usage: .horse <amount> <your horse (1-5)>' });

  const balance = getWallet(user);
  if (bet > balance)
    return sock.sendMessage(from, { text: '❌ Not enough coins.' });

  await sock.sendMessage(from, { text: '🐎 The horses are lining up at the start line...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '📢 The crowd roars as the gates open!' });
  await sleep(1000);

  const horses = ['1', '2', '3', '4', '5'];
  const positions = [0, 0, 0, 0, 0];

  for (let i = 0; i < 20; i++) {
    const advancingHorse = Math.floor(Math.random() * 5);
    positions[advancingHorse] += 1;

    const visuals = positions.map((pos, index) => {
      const track = '─'.repeat(pos) + `🏇 Horse ${index + 1}`;
      return track;
    }).join('\n');

    await sock.sendMessage(from, { text: `🏁 Race Update:\n\n${visuals}` });
    await sleep(700);
  }

  const maxPosition = Math.max(...positions);
  const winners = positions
    .map((pos, index) => ({ pos, index }))
    .filter(h => h.pos === maxPosition)
    .map(h => h.index + 1);

  const winner = winners[Math.floor(Math.random() * winners.length)];

  await sock.sendMessage(from, { text: `🎊 Approaching the finish line...` });
  await sleep(1000);
  await sock.sendMessage(from, { text: `🔥 And the crowd is going wild!` });
  await sleep(1000);
  await sock.sendMessage(from, { text: `🥇 Horse ${winner} crosses the finish line first!` });

  if (pick === winner) {
    addCoins(user, bet * 2);
    await sock.sendMessage(from, { text: `🎉 You picked Horse ${pick} and WON ${formatCoins(bet * 2)}!` });
  } else {
    removeCoins(user, bet);
    await sock.sendMessage(from, { text: `😢 Horse ${pick} didn't win. You lost ${formatCoins(bet)}.` });
  }
}

// 🪙 .wallet
async function wallet(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const coins = getWallet(user);
  await sock.sendMessage(from, { text: `👛 Your wallet: ${formatCoins(coins)}` });
}

// 🎁 .daily
const dailyClaimed = new Set();

async function daily(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  if (dailyClaimed.has(user)) {
    await sock.sendMessage(from, { text: '🕒 You already claimed your daily reward. Try again later.' });
    return;
  }

  const reward = 500;
  addCoins(user, reward);
  dailyClaimed.add(user);
  await sock.sendMessage(from, { text: `🎁 You claimed your daily reward of ${formatCoins(reward)}!` });

  setTimeout(() => dailyClaimed.delete(user), 24 * 60 * 60 * 1000);
}

export default {
  horse,
  wallet,
  daily,
};
