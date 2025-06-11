// 📦 In-memory coin system (temporary)
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

// 📘 .wallet command
async function wallet(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const balance = getCoins(user);
  await sock.sendMessage(from, {
    text: `👛 Wallet:
You have ${formatCoins(balance)}.`
  });
}

// 🎁 .daily command
async function daily(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const reward = 500;
  const current = getCoins(user);
  setCoins(user, current + reward);
  await sock.sendMessage(from, {
    text: `🎁 Daily Reward:
You received ${formatCoins(reward)}! Come back tomorrow.`
  });
}

// 🐎 .horse command
async function horse(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0 || isNaN(pick) || pick < 1 || pick > 5) {
    return sock.sendMessage(from, {
      text: '❗ Usage: .horse <amount> <pick 1-5>'
    });
  }

  const balance = getCoins(user);
  if (bet > balance) {
    return sock.sendMessage(from, {
      text: '❌ Not enough coins.'
    });
  }

  await sock.sendMessage(from, { text: '🏇 Horses are lining up at the gate...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🎺 The trumpet sounds! Riders ready!' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🔥 The race is starting in 3... 2... 1...' });
  await sleep(1000);

  const horses = [0, 0, 0, 0, 0];
  const finishLine = 10;

  for (let i = 0; i < 20; i++) {
    const advancingHorse = Math.floor(Math.random() * 5);
    horses[advancingHorse] += 1;
    
    const display = horses.map((pos, index) => {
      const horseNum = index + 1;
      const track = ' '.repeat(pos) + `🐎${horseNum}`;
      return track;
    }).join('\n');

    await sock.sendMessage(from, { text: `🏁 Race Update:
${display}` });
    await sleep(800);
  }

  // Determine the winner
  const winner = horses.indexOf(Math.max(...horses)) + 1;

  // Hype reveal
  await sock.sendMessage(from, { text: '🔍 Reviewing the footage...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '📣 And the crowd goes wild...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: `🥁 The winner is... HORSE ${winner}!!! 🏆` });
  await sleep(1000);

  if (winner === pick) {
    const winAmount = bet * 3;
    setCoins(user, balance + winAmount);
    await sock.sendMessage(from, {
      text: `🎉 Congratulations! Horse ${winner} won!
You won ${formatCoins(winAmount)}!`
    });
  } else {
    setCoins(user, balance - bet);
    await sock.sendMessage(from, {
      text: `😢 Horse ${winner} won. You picked Horse ${pick}.
You lost ${formatCoins(bet)}.`
    });
  }
}

export default {
  wallet,
  daily,
  horse
};
