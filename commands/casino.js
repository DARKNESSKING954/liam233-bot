// casino.js
import { getWallet, addCoins, removeCoins } from '../memory.js';

function formatCoins(amount) {
  return `💰 ${amount} coins`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🎉 .daily command
async function daily(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  addCoins(user, 500);
  await sock.sendMessage(from, {
    text: `🎁 Daily reward claimed! You received ${formatCoins(500)}.`
  });
}

// 💳 .wallet command
async function wallet(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const balance = getWallet(user);

  await sock.sendMessage(from, {
    text: `💰 Your current balance: ${formatCoins(balance)}`
  });
}

// 🐎 .horse command
async function horse(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || isNaN(pick) || bet <= 0 || pick < 1 || pick > 5) {
    return sock.sendMessage(from, {
      text: '❗ Usage: .horse <bet> <pick 1-5>'
    });
  }

  const balance = getWallet(user);
  if (bet > balance) {
    return sock.sendMessage(from, {
      text: '❌ Not enough coins.'
    });
  }

  const horses = ['1️⃣ Horse 1 🐎', '2️⃣ Horse 2 🐎', '3️⃣ Horse 3 🐎', '4️⃣ Horse 4 🐎', '5️⃣ Horse 5 🐎'];
  await sock.sendMessage(from, { text: '🏃 Horses lining up at the starting line...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '✅ Riders ready, track clear...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '⏱️ 3... 2... 1... GO!' });
  await sleep(1000);

  for (let i = 0; i < 16; i++) {
    const update = horses.map((h, index) => `${h} ${'🏁'.padStart(Math.floor(Math.random() * 12) + 3, '—')}`).join('\n');
    await sock.sendMessage(from, { text: `🚤 Race Update #${i + 1}\n\n${update}` });
    await sleep(700);
  }

  const winner = Math.floor(Math.random() * 5) + 1;

  await sock.sendMessage(from, { text: '⏳ Approaching the finish line!' });
  await sleep(1000);
  await sock.sendMessage(from, { text: `🏆 It's neck and neck... Who will take it?!` });
  await sleep(1200);
  await sock.sendMessage(from, { text: `🥇 HORSE ${winner} bursts through the finish line first! 🏁` });

  if (pick === winner) {
    addCoins(user, bet * 3);
    await sock.sendMessage(from, {
      text: `🎉 You picked HORSE ${pick} and it won! You earned ${formatCoins(bet * 3)}!`
    });
  } else {
    removeCoins(user, bet);
    await sock.sendMessage(from, {
      text: `😔 HORSE ${winner} won. You picked HORSE ${pick}. You lost ${formatCoins(bet)}.`
    });
  }
}

export default {
  daily,
  wallet,
  horse
};
