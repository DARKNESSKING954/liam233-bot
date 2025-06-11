const users = new Map();

// Helper: Get and update coins
function getBalance(id) {
  return users.get(id) || 1000;
}

function updateBalance(id, amount) {
  const current = getBalance(id);
  users.set(id, current + amount);
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// 💼 Wallet / Balance
const wallet = async (sock, m) => {
  const id = m.sender;
  const balance = getBalance(id);
  await sock.sendMessage(m.chat, { text: `💼 Your balance: 💰 ${balance} coins.` });
};
const balance = wallet;

// 🎁 Daily Reward
const daily = async (sock, m) => {
  const id = m.sender;
  updateBalance(id, 500);
  await sock.sendMessage(m.chat, { text: `🎉 You received 500 daily coins!` });
};

// 🎰 Slot Machine
const slot = async (sock, m, args) => {
  const id = m.sender;
  const bet = parseInt(args[0]);
  if (isNaN(bet) || bet <= 0) return sock.sendMessage(m.chat, { text: `❌ Enter a valid bet.` });

  const balance = getBalance(id);
  if (balance < bet) return sock.sendMessage(m.chat, { text: `💸 You don't have enough coins.` });

  const symbols = ['🍒', '🍋', '🍇', '🔔', '💎'];
  await sock.sendMessage(m.chat, { text: `🎰 Slot machine warming up...` });
  await delay(800);
  await sock.sendMessage(m.chat, { text: `🔄 Spinning reels...` });
  await delay(800);
  await sock.sendMessage(m.chat, { text: `✨ Symbols aligning...` });
  await delay(800);
  await sock.sendMessage(m.chat, { text: `🎲 Final result incoming...` });
  await delay(1200);

  const result = [0, 0, 0].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
  const display = result.join(" | ");
  const win = result.every(v => v === result[0]);

  if (win) {
    const reward = bet * 5;
    updateBalance(id, reward);
    await sock.sendMessage(m.chat, { text: `🎉 ${display}\nJackpot! You won 💰 ${reward} coins!` });
  } else {
    updateBalance(id, -bet);
    await sock.sendMessage(m.chat, { text: `😢 ${display}\nYou lost 💸 ${bet} coins.` });
  }
};

// 🎲 Dice Game
const dice = async (sock, m, args) => {
  const id = m.sender;
  const bet = parseInt(args[0]);
  if (isNaN(bet) || bet <= 0) return sock.sendMessage(m.chat, { text: `❌ Enter a valid bet.` });

  const balance = getBalance(id);
  if (balance < bet) return sock.sendMessage(m.chat, { text: `💸 Not enough coins.` });

  await sock.sendMessage(m.chat, { text: `🎲 Rolling your dice...` });
  await delay(1000);
  await sock.sendMessage(m.chat, { text: `🧊 Opponent is rolling...` });
  await delay(1000);
  await sock.sendMessage(m.chat, { text: `🔁 Comparing results...` });
  await delay(1000);

  const userRoll = Math.floor(Math.random() * 6) + 1;
  const botRoll = Math.floor(Math.random() * 6) + 1;

  if (userRoll > botRoll) {
    updateBalance(id, bet);
    await sock.sendMessage(m.chat, { text: `🎉 You rolled ${userRoll} vs Bot ${botRoll}\nYou won 💰 ${bet} coins!` });
  } else if (userRoll < botRoll) {
    updateBalance(id, -bet);
    await sock.sendMessage(m.chat, { text: `😢 You rolled ${userRoll} vs Bot ${botRoll}\nYou lost 💸 ${bet} coins.` });
  } else {
    await sock.sendMessage(m.chat, { text: `🤝 Draw! You both rolled ${userRoll}.\nNo coins lost.` });
  }
};

// 🐎 Horse Race
const horse = async (sock, m, args) => {
  const id = m.sender;
  const bet = parseInt(args[0]);
  if (isNaN(bet) || bet <= 0) return sock.sendMessage(m.chat, { text: `❌ Invalid bet.` });

  const balance = getBalance(id);
  if (balance < bet) return sock.sendMessage(m.chat, { text: `💸 Not enough coins.` });

  const horses = ['🐎', '🐴', '🦄', '🐐'];
  await sock.sendMessage(m.chat, { text: `🏇 Preparing the race...` });
  await delay(1000);
  await sock.sendMessage(m.chat, { text: `🔔 Horses at the gate...` });
  await delay(1000);
  await sock.sendMessage(m.chat, { text: `🚦 And they're off!` });
  await delay(1000);
  await sock.sendMessage(m.chat, { text: `🏁 Final stretch! Winner incoming...` });
  await delay(1200);

  const winner = horses[Math.floor(Math.random() * horses.length)];
  const win = Math.random() < 0.5;

  if (win) {
    updateBalance(id, bet * 3);
    await sock.sendMessage(m.chat, { text: `🎉 ${winner} crossed the line!\nYou won 💰 ${bet * 3} coins!` });
  } else {
    updateBalance(id, -bet);
    await sock.sendMessage(m.chat, { text: `😢 Your horse slipped!\nYou lost 💸 ${bet} coins.` });
  }
};

// 🪙 Coinflip
const coinflip = async (sock, m, args) => {
  const id = m.sender;
  const choice = (args[0] || '').toLowerCase();
  const bet = parseInt(args[1]);

  if (!['heads', 'tails'].includes(choice) || isNaN(bet) || bet <= 0)
    return sock.sendMessage(m.chat, { text: `❌ Usage: .coinflip heads/tails <amount>` });

  const balance = getBalance(id);
  if (balance < bet) return sock.sendMessage(m.chat, { text: `💸 Not enough coins.` });

  await sock.sendMessage(m.chat, { text: `🪙 Tossing the coin...` });
  await delay(800);
  await sock.sendMessage(m.chat, { text: `✨ In the air...` });
  await delay(800);
  await sock.sendMessage(m.chat, { text: `💨 Spinning mid-air...` });
  await delay(1000);

  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  if (result === choice) {
    updateBalance(id, bet * 2);
    await sock.sendMessage(m.chat, { text: `🎉 It's ${result}! You won 💰 ${bet * 2} coins!` });
  } else {
    updateBalance(id, -bet);
    await sock.sendMessage(m.chat, { text: `😢 It's ${result}. You lost 💸 ${bet} coins.` });
  }
};

// 💥 Crash Game
const crash = async (sock, m, args) => {
  const id = m.sender;
  const bet = parseInt(args[0]);
  if (isNaN(bet) || bet <= 0) return sock.sendMessage(m.chat, { text: `❌ Invalid bet.` });

  const balance = getBalance(id);
  if (balance < bet) return sock.sendMessage(m.chat, { text: `💸 Not enough coins.` });

  let multiplier = 1.0;
  const crashPoint = parseFloat((Math.random() * 3 + 1.5).toFixed(2));

  await sock.sendMessage(m.chat, { text: `🚀 Launching game...` });

  const interval = setInterval(async () => {
    multiplier = parseFloat((multiplier + 0.2).toFixed(2));
    if (multiplier >= crashPoint) {
      clearInterval(interval);
      updateBalance(id, -bet);
      await sock.sendMessage(m.chat, { text: `💥 Crashed at x${multiplier}\nYou lost 💸 ${bet} coins.` });
      return;
    }

    if (multiplier >= 2.0) {
      clearInterval(interval);
      const reward = Math.floor(bet * multiplier);
      updateBalance(id, reward);
      await sock.sendMessage(m.chat, { text: `✅ Cashed out at x${multiplier}\nYou won 💰 ${reward} coins!` });
      return;
    }

    await sock.sendMessage(m.chat, { text: `📈 Multiplier: x${multiplier}` });
  }, 900);
};

// 📦 Export all
export default {
  wallet,
  balance,
  daily,
  slot,
  dice,
  horse,
  coinflip,
  crash
};
