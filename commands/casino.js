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

// 🎰 .slot command - fixed with interactive texts and pick 1-20
async function slot(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  if (args.length < 2) {
    return sock.sendMessage(from, { text: '❗ Usage: .slot <bet> <pick number 1-20>' });
  }

  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0) {
    return sock.sendMessage(from, { text: '❗ Invalid bet amount.' });
  }

  if (isNaN(pick) || pick < 1 || pick > 20) {
    return sock.sendMessage(from, { text: '❗ Pick a number between 1 and 20.' });
  }

  const balance = getCoins(user);
  if (bet > balance) {
    return sock.sendMessage(from, { text: '❌ Not enough coins.' });
  }

  // Four interactive messages before results
  await sock.sendMessage(from, { text: '🎰 Pulling the lever...' });
  await sleep(1200);
  await sock.sendMessage(from, { text: '🔄 Slots spinning rapidly...' });
  await sleep(1200);
  await sock.sendMessage(from, { text: '🍒 🍋 🍊 🍇 ⭐ 🔔 ... who will win?' });
  await sleep(1200);
  await sock.sendMessage(from, { text: '🧠 Calculating luck and fate...' });
  await sleep(1200);

  const slots = ['🍒', '🍋', '🍊', '🍇', '⭐', '🔔'];

  // Generate 3 random slot indices 1-20, map to emojis
  const slotResults = [];
  for (let i = 0; i < 3; i++) {
    const slotIndex = Math.floor(Math.random() * 20) + 1;
    const emoji = slots[(slotIndex - 1) % slots.length];
    slotResults.push({ emoji, index: slotIndex });
  }

  const display = slotResults.map(r => r.emoji).join(' ');

  const isWin = slotResults.some(r => r.index === pick);

  if (isWin) {
    setCoins(user, balance + bet * 3);
    await sock.sendMessage(from, { text: `🎉 ${display}\nYour pick ${pick} matched! You won ${formatCoins(bet * 3)}!` });
  } else {
    setCoins(user, balance - bet);
    await sock.sendMessage(from, { text: `😢 ${display}\nYour pick ${pick} didn't match. You lost ${formatCoins(bet)}.` });
  }
}

// 🐎 .horse command with four interactive messages (already working)
async function horse(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);

  if (isNaN(bet) || bet <= 0) return sock.sendMessage(from, { text: '❗ Usage: .horse <amount>' });

  const balance = getCoins(user);
  if (bet > balance) return sock.sendMessage(from, { text: '❌ Not enough coins.' });

  await sock.sendMessage(from, { text: '🐎 The horses are lining up...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '📢 The race is about to start...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🔥 And they’re off! Galloping down the track...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🏁 Nearing the finish line!' });

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

// 📅 .daily command - simple daily coins claim
const dailyCooldown = new Map();

async function daily(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  const now = Date.now();
  const cooldown = dailyCooldown.get(user) || 0;
  const oneDay = 24 * 60 * 60 * 1000;

  if (now - cooldown < oneDay) {
    const remaining = Math.ceil((oneDay - (now - cooldown)) / 3600000);
    return sock.sendMessage(from, { text: `⏳ Daily already claimed! Come back in ${remaining} hour(s).` });
  }

  const reward = 500;
  const balance = getCoins(user);
  setCoins(user, balance + reward);
  dailyCooldown.set(user, now);

  await sock.sendMessage(from, { text: `🎉 You claimed your daily ${formatCoins(reward)}!` });
}

// 👛 .wallet command - show user coin balance
async function wallet(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  const balance = getCoins(user);
  await sock.sendMessage(from, { text: `👛 Your wallet balance: ${formatCoins(balance)}` });
}

export default { slot, horse, daily, wallet };