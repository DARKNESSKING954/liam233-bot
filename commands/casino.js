// 📦 In-memory coin system
const userCoins = new Map();

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

// 💳 .wallet command
async function wallet(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const balance = getCoins(user);
  await sock.sendMessage(from, { text: `💼 Wallet Balance: ${formatCoins(balance)}` });
}

// 🎁 .daily command
async function daily(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const current = getCoins(user);
  const reward = 500;
  setCoins(user, current + reward);
  await sock.sendMessage(from, { text: `🎉 You've claimed your daily reward of ${formatCoins(reward)}!` });
}

// 🐎 .horse command
async function horse(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const choice = parseInt(args[1]);

  if (isNaN(bet) || isNaN(choice) || bet <= 0 || choice < 1 || choice > 5) {
    return sock.sendMessage(from, { text: '❗ Usage: .horse <amount> <pick (1-5)>' });
  }

  const balance = getCoins(user);
  if (bet > balance) {
    return sock.sendMessage(from, { text: '❌ Not enough coins.' });
  }

  const horses = [0, 0, 0, 0, 0];
  const horseEmojis = ['🐎1', '🐎2', '🐎3', '🐎4', '🐎5'];
  const finishLine = 10;

  await sock.sendMessage(from, { text: '🏁 The race is about to begin! Five horses are at the starting line!' });
  await sleep(1500);

  let raceOngoing = true;
  while (raceOngoing) {
    for (let i = 0; i < horses.length; i++) {
      horses[i] += Math.random() < 0.5 ? 1 : 0;
      if (horses[i] > finishLine) horses[i] = finishLine;
    }

    const raceVisual = horses.map((pos, index) => {
      const track = '━'.repeat(pos) + horseEmojis[index] + ' '.repeat(finishLine - pos);
      return `${track} 🏁`;
    }).join('\n');

    await sock.sendMessage(from, { text: `🏇 Race Progress:\n\n${raceVisual}` });
    await sleep(1300);

    if (horses.some(h => h >= finishLine)) {
      raceOngoing = false;
    }
  }

  const winnerIndex = horses.findIndex(h => h >= finishLine);
  const winner = winnerIndex + 1;

  // Final suspense and hype
  await sleep(1500);
  await sock.sendMessage(from, { text: '🔍 Checking photo finish...' });
  await sleep(1500);
  await sock.sendMessage(from, { text: '📸 Zooming in on the track...' });
  await sleep(1500);
  await sock.sendMessage(from, { text: `🥇 Horse ${winner} crosses the finish line first!` });

  if (winner === choice) {
    const reward = bet * 3;
    setCoins(user, balance + reward);
    await sock.sendMessage(from, { text: `🎉 You picked Horse ${choice} and WON ${formatCoins(reward)}!` });
  } else {
    setCoins(user, balance - bet);
    await sock.sendMessage(from, { text: `😢 You picked Horse ${choice}, but Horse ${winner} won. You lost ${formatCoins(bet)}.` });
  }
}

export default {
  wallet,
  daily,
  horse
};
