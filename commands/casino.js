// 📦 In-memory coin system (replace with DB if needed)
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

// 🎰 .slot command
async function slot(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  if (isNaN(bet) || bet <= 0) return sock.sendMessage(from, { text: '❗ Usage: .slot <amount>' });

  const balance = getCoins(user);
  if (bet > balance) return sock.sendMessage(from, { text: '❌ Not enough coins.' });

  const slots = ['🍒', '🍋', '🍊', '🍇', '⭐', '🔔'];

  await sock.sendMessage(from, { text: '🎰 Pulling the lever...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🔄 Spinning the slots...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🎲 Almost there...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🧠 Calculating your fate...' });
  await sleep(1000);

  const result = [
    slots[Math.floor(Math.random() * slots.length)],
    slots[Math.floor(Math.random() * slots.length)],
    slots[Math.floor(Math.random() * slots.length)]
  ];
  const display = result.join(' ');
  const win = result[0] === result[1] && result[1] === result[2];

  if (win) {
    setCoins(user, balance + bet * 3);
    await sock.sendMessage(from, { text: `🎉 ${display}\nYou won ${formatCoins(bet * 3)}!` });
  } else {
    setCoins(user, balance - bet);
    await sock.sendMessage(from, { text: `😢 ${display}\nYou lost ${formatCoins(bet)}.` });
  }
}

// 🪙 .coinflip <amount> <heads/tails>
async function coinflip(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const guess = args[1]?.toLowerCase();

  if (!['heads', 'tails'].includes(guess)) return sock.sendMessage(from, { text: '❗ Usage: .coinflip <amount> <heads/tails>' });
  if (isNaN(bet) || bet <= 0) return sock.sendMessage(from, { text: '❗ Invalid bet amount.' });

  const balance = getCoins(user);
  if (bet > balance) return sock.sendMessage(from, { text: '❌ Not enough coins.' });

  await sock.sendMessage(from, { text: '🪙 Tossing the coin in the air...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🌀 It spins and glimmers...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '⚖️ Landing soon...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '👀 And the result is...' });
  await sleep(1000);

  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  if (result === guess) {
    setCoins(user, balance + bet);
    await sock.sendMessage(from, { text: `🎉 It's ${result}! You won ${formatCoins(bet)}!` });
  } else {
    setCoins(user, balance - bet);
    await sock.sendMessage(from, { text: `😢 It's ${result}. You lost ${formatCoins(bet)}.` });
  }
}

// 🐎 .horse <amount>
async function horse(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const balance = getCoins(user);
  if (isNaN(bet) || bet <= 0) return sock.sendMessage(from, { text: '❗ Usage: .horse <amount>' });
  if (bet > balance) return sock.sendMessage(from, { text: '❌ Not enough coins.' });

  await sock.sendMessage(from, { text: '🐎 The horses are lining up...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '📢 The race is about to start...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🔥 And they’re off! Galloping down the track...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🏁 Nearing the finish line!' });
  await sleep(1000);

  const horses = ['🏇 Red', '🏇 Blue', '🏇 Green'];
  const winner = horses[Math.floor(Math.random() * horses.length)];
  const win = winner.includes('Red');

  if (win) {
    setCoins(user, balance + bet * 2);
    await sock.sendMessage(from, { text: `🥇 ${winner} wins! You earned ${formatCoins(bet * 2)}!` });
  } else {
    setCoins(user, balance - bet);
    await sock.sendMessage(from, { text: `❌ ${winner} wins. You lost ${formatCoins(bet)}.` });
  }
}

// 📉 .crash <amount>
async function crash(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  if (isNaN(bet) || bet <= 0) return sock.sendMessage(from, { text: '❗ Usage: .crash <amount>' });

  const balance = getCoins(user);
  if (bet > balance) return sock.sendMessage(from, { text: '❌ Not enough coins.' });

  await sock.sendMessage(from, { text: '📈 Placing bet...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🚀 Market is rising...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '📊 Profit increasing...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '⚠️ Hold or cash out?' });
  await sleep(1000);

  const multiplier = Math.random() * 3 + 1;
  const win = multiplier > 1.5;
  const gain = Math.floor(bet * multiplier);

  if (win) {
    setCoins(user, balance + gain);
    await sock.sendMessage(from, { text: `💸 Crashed at x${multiplier.toFixed(2)}! You earned ${formatCoins(gain)}.` });
  } else {
    setCoins(user, balance - bet);
    await sock.sendMessage(from, { text: `💥 Crashed too early! You lost ${formatCoins(bet)}.` });
  }
}

export default {
  slot,
  coinflip,
  horse,
  crash
};