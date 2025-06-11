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

// 🐎 .horse command with 10 interactive messages and user picks horse 1-5
async function horse(sock, msg, args) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  if (args.length < 2) {
    return sock.sendMessage(from, { text: '❗ Usage: .horse <bet> <pick number 1-5>' });
  }

  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0) {
    return sock.sendMessage(from, { text: '❗ Invalid bet amount.' });
  }

  if (isNaN(pick) || pick < 1 || pick > 5) {
    return sock.sendMessage(from, { text: '❗ Pick a horse number between 1 and 5.' });
  }

  const balance = getCoins(user);
  if (bet > balance) {
    return sock.sendMessage(from, { text: '❌ Not enough coins.' });
  }

  // Define horses 1-5
  const horses = ['🏇 Horse 1', '🏇 Horse 2', '🏇 Horse 3', '🏇 Horse 4', '🏇 Horse 5'];

  // Interactive race messages (10 steps)
  const raceMessages = [
    '🐎 The horses are getting ready at the starting gate...',
    '🎺 The crowd is cheering loudly!',
    '🏇 Horses are pawing the ground nervously...',
    '🔔 The bell rings! They\'re off!',
    '🏃‍♂️ Horses burst out of the gate at full speed!',
    '💨 Dust flies as they thunder down the track!',
    '🔥 It\'s a tight race, neck and neck!',
    '💥 One horse takes the lead!',
    '🏁 Approaching the finish line fast!',
    '🥳 The race is about to end... who will win?'
  ];

  for (const msgText of raceMessages) {
    await sock.sendMessage(from, { text: msgText });
    await sleep(1500);
  }

  // Decide random winner 1-5
  const winnerIndex = Math.floor(Math.random() * 5);
  const winnerHorse = horses[winnerIndex];

  const userWin = (pick - 1) === winnerIndex;

  if (userWin) {
    const winnings = bet * 3;
    setCoins(user, balance + winnings);
    await sock.sendMessage(from, { text: `🏆 ${winnerHorse} wins the race!\n🎉 Congrats! You picked horse ${pick} and won ${formatCoins(winnings)}!` });
  } else {
    setCoins(user, balance - bet);
    await sock.sendMessage(from, { text: `🏆 ${winnerHorse} wins the race.\n😞 You picked horse ${pick} and lost ${formatCoins(bet)}.` });
  }
}

// 📅 .daily command - simple daily coins claim with 24h cooldown
const dailyCooldown = new Map();

async function daily(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  const now = Date.now();
  const cooldown = dailyCooldown.get(user) || 0;
  const oneDay = 24 * 60 * 60 * 1000;

  if (now - cooldown < oneDay) {
    const remainingMs = oneDay - (now - cooldown);
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return sock.sendMessage(from, { text: `⏳ You already claimed your daily coins! Come back in ${remainingHours}h ${remainingMinutes}m.` });
  }

  const reward = 500;
  const balance = getCoins(user);
  setCoins(user, balance + reward);
  dailyCooldown.set(user, now);

  await sock.sendMessage(from, { text: `🎉 You claimed your daily reward of ${formatCoins(reward)}!` });
}

// 👛 .wallet command - show user coin balance
async function wallet(sock, msg) {
  const user = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;

  const balance = getCoins(user);
  await sock.sendMessage(from, { text: `👛 Your wallet balance: ${formatCoins(balance)}` });
}

export default { horse, daily, wallet };