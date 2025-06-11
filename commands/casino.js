// 📦 In-memory coin system
const userCoins = new Map();
const claimedDaily = new Set();

function getCoins(user) {
  return userCoins.get(user) || 1000;
}

function setCoins(user, amount) {
  userCoins.set(user, amount);
}

function formatCoins(amount) {
  return `💰 ${amount} coins`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 💸 .wallet command
async function wallet(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const balance = getCoins(user);
  await sock.sendMessage(from, { text: `💰 You have ${formatCoins(balance)}.` });
}

// 🎁 .daily command
async function daily(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  if (claimedDaily.has(user)) {
    await sock.sendMessage(from, { text: '⏱️ You already claimed your daily reward. Come back tomorrow!' });
    return;
  }

  claimedDaily.add(user);
  const current = getCoins(user);
  setCoins(user, current + 500);
  await sock.sendMessage(from, { text: `🎁 You claimed your daily reward: ${formatCoins(500)}!` });

  setTimeout(() => claimedDaily.delete(user), 86400000); // 24 hours
}

// 🐴 .horse <amount> <1-5>
async function horse(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0 || isNaN(pick) || pick < 1 || pick > 5) {
    return sock.sendMessage(from, { text: '❗ Usage: .horse <amount> <pick 1-5>' });
  }

  const balance = getCoins(user);
  if (bet > balance) return sock.sendMessage(from, { text: '❌ Not enough coins.' });

  const horses = [1, 2, 3, 4, 5];
  const progress = [0, 0, 0, 0, 0];

  await sock.sendMessage(from, { text: `🐎 The horses are entering the track...` });
  await sleep(1000);
  await sock.sendMessage(from, { text: `🎌 Get ready! You picked Horse ${pick}!` });
  await sleep(1000);

  for (let i = 0; i < 20; i++) {
    const advancing = Math.floor(Math.random() * 5);
    progress[advancing] += Math.floor(Math.random() * 3) + 1;

    const display = horses.map((h, idx) => `🏇 Horse ${h}: ${'▬'.repeat(progress[idx])}`).join('\n');
    await sock.sendMessage(from, { text: `🏁 Race Update ${i + 1}:
${display}` });
    await sleep(1000);
  }

  const winnerIndex = progress.indexOf(Math.max(...progress));
  const winner = horses[winnerIndex];

  await sock.sendMessage(from, { text: '🔍 Analyzing final photo finish...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: `🎉 Crowd is cheering... tension rising!` });
  await sleep(1000);
  await sock.sendMessage(from, { text: `🥁 Drumroll... and the winner is...` });
  await sleep(1000);

  if (pick === winner) {
    const reward = bet * 4;
    setCoins(user, balance + reward);
    await sock.sendMessage(from, { text: `🏆 Horse ${winner} wins the race!
You won ${formatCoins(reward)}! 🎊` });
  } else {
    setCoins(user, balance - bet);
    await sock.sendMessage(from, { text: `🏴 Horse ${winner} wins the race.
You lost ${formatCoins(bet)}. Try again!` });
  }
}

export default {
  wallet,
  daily,
  horse
};
