// 📦 In-memory coin system (replace with DB if needed)
const userCoins = new Map();
const userDaily = new Map();

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
  await sock.sendMessage(from, { text: `👛 Your balance: ${formatCoins(balance)}` });
}

// 🎁 .daily command
async function daily(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const now = Date.now();
  const lastClaim = userDaily.get(user) || 0;
  if (now - lastClaim < 86400000) {
    const remaining = Math.ceil((86400000 - (now - lastClaim)) / 3600000);
    return sock.sendMessage(from, { text: `🕒 You've already claimed your daily coins. Try again in ${remaining} hour(s).` });
  }
  userDaily.set(user, now);
  const current = getCoins(user);
  setCoins(user, current + 1000);
  await sock.sendMessage(from, { text: `🎉 You received your daily ${formatCoins(1000)}!` });
}

// 🎰 .slot <bet> <number between 1-20>
async function slot(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const guess = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0 || isNaN(guess) || guess < 1 || guess > 20) {
    return sock.sendMessage(from, { text: '❗ Usage: .slot <amount> <1-20>' });
  }

  const balance = getCoins(user);
  if (bet > balance) return sock.sendMessage(from, { text: '❌ Not enough coins.' });

  await sock.sendMessage(from, { text: '🎰 Inserting coins...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🌀 Spinning the wheels...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '✨ Matching your number with luck...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🧠 Calculating the final result...' });

  const random = Math.floor(Math.random() * 20) + 1;
  if (random === guess) {
    const win = bet * 5;
    setCoins(user, balance + win);
    return sock.sendMessage(from, { text: `🎉 Lucky number was ${random} — You matched it!
You won ${formatCoins(win)}!` });
  } else {
    setCoins(user, balance - bet);
    return sock.sendMessage(from, { text: `😢 Lucky number was ${random} — You guessed ${guess}.
You lost ${formatCoins(bet)}.` });
  }
}

// 🐎 .horse <bet> <number between 1-20>
async function horse(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const guess = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0 || isNaN(guess) || guess < 1 || guess > 20) {
    return sock.sendMessage(from, { text: '❗ Usage: .horse <amount> <1-20>' });
  }

  const balance = getCoins(user);
  if (bet > balance) return sock.sendMessage(from, { text: '❌ Not enough coins.' });

  await sock.sendMessage(from, { text: '🐎 Horses getting ready at the gate...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '📢 They’re lining up...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🔥 And they’re off!' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🏁 Approaching the finish line!' });

  const winningHorse = Math.floor(Math.random() * 20) + 1;
  if (winningHorse === guess) {
    const win = bet * 4;
    setCoins(user, balance + win);
    return sock.sendMessage(from, { text: `🥇 Horse ${winningHorse} wins! You guessed right!
You won ${formatCoins(win)}!` });
  } else {
    setCoins(user, balance - bet);
    return sock.sendMessage(from, { text: `❌ Horse ${winningHorse} wins. You guessed ${guess}.
You lost ${formatCoins(bet)}.` });
  }
}

export default { wallet, daily, slot, horse };
