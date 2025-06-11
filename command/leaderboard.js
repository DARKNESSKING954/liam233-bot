// commands/casino.js
// 📦 LiamBot casino Commands — Full implementation

import * as memory from "../memory.js";

// 📌 Helper: Random integer between min and max (inclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const wallet = (sock, msg) => {
  const userId = msg.key.participant || msg.key.remoteJid;
  const coins = memory.getWallet(userId);
  return sock.sendMessage(msg.key.remoteJid, { text: `💰 You have ${coins} coins.` });
};

export const daily = (sock, msg) => {
  const userId = msg.key.participant || msg.key.remoteJid;
  const reward = 500;
  memory.addCoins(userId, reward);
  return sock.sendMessage(msg.key.remoteJid, { text: `🎁 Daily reward: +${reward} coins.` });
};

export const slot = (sock, msg, args) => {
  const userId = msg.key.participant || msg.key.remoteJid;
  const bet = parseInt(args[0]);
  if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .slot [bet]" });
  if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

  memory.removeCoins(userId, bet);

  const slots = ["🍒", "🍋", "🍊", "🍉", "⭐", "7️⃣"];
  const spin = [slots[randInt(0, 5)], slots[randInt(0, 5)], slots[randInt(0, 5)]];
  let payout = 0;

  if (spin[0] === spin[1] && spin[1] === spin[2]) payout = bet * 5;
  else if (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]) payout = bet * 2;

  if (payout) memory.addCoins(userId, payout);

  sock.sendMessage(msg.key.remoteJid, { text: `🎰 [ ${spin.join(" ")} ]\n${payout ? `You won ${payout} coins!` : `Lost ${bet} coins.`}` });
};

export const coinflip = (sock, msg, args) => {
  const userId = msg.key.participant || msg.key.remoteJid;
  if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .coinflip [heads/tails] [bet]" });
  const choice = args[0].toLowerCase();
  const bet = parseInt(args[1]);
  if (!["heads", "tails"].includes(choice)) return sock.sendMessage(msg.key.remoteJid, { text: "Pick heads or tails." });
  if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "Invalid bet." });
  if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

  memory.removeCoins(userId, bet);
  const flip = Math.random() < 0.5 ? "heads" : "tails";

  if (flip === choice) {
    memory.addCoins(userId, bet * 2);
    sock.sendMessage(msg.key.remoteJid, { text: `🪙 Coin landed on ${flip}!\nYou won ${bet} coins.` });
  } else {
    sock.sendMessage(msg.key.remoteJid, { text: `🪙 Coin landed on ${flip}.\nYou lost ${bet} coins.` });
  }
};

export const dice = (sock, msg, args) => {
  const userId = msg.key.participant || msg.key.remoteJid;
  if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .dice [1-6] [bet]" });
  const guess = parseInt(args[0]);
  const bet = parseInt(args[1]);
  if (guess < 1 || guess > 6 || !bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "Invalid guess or bet." });
  if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

  memory.removeCoins(userId, bet);
  const roll = randInt(1, 6);

  if (roll === guess) {
    memory.addCoins(userId, bet * 6);
    sock.sendMessage(msg.key.remoteJid, { text: `🎲 Rolled a ${roll}! You won ${bet * 6} coins.` });
  } else {
    sock.sendMessage(msg.key.remoteJid, { text: `🎲 Rolled a ${roll}. Lost ${bet} coins.` });
  }
};

export const roulette = (sock, msg, args) => {
  const userId = msg.key.participant || msg.key.remoteJid;
  if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .roulette [red/black/green/number] [bet]" });
  const betType = args[0].toLowerCase();
  const bet = parseInt(args[1]);
  if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "Invalid bet." });
  if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

  memory.removeCoins(userId, bet);
  const spin = randInt(0, 36);
  const color = (spin === 0) ? "green" : (spin % 2 === 0 ? "black" : "red");

  let payout = 0;
  if (["red", "black", "green"].includes(betType)) {
    if (color === betType) payout = bet * (betType === "green" ? 14 : 2);
  } else if (parseInt(betType) === spin) {
    payout = bet * 35;
  }

  if (payout) memory.addCoins(userId, payout);

  sock.sendMessage(msg.key.remoteJid, { text: `🎡 Roulette: ${spin} (${color})\n${payout ? `You won ${payout}!` : `Lost ${bet}.`}` });
};

export const blackjack = (sock, msg, args) => {
  const userId = msg.key.participant || msg.key.remoteJid;
  const bet = parseInt(args[0]);
  if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .blackjack [bet]" });
  if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

  memory.removeCoins(userId, bet);
  const player = randInt(16, 21);
  const dealer = randInt(15, 21);

  let result = `🃏 You: ${player} | Dealer: ${dealer}\n`;
  if (player > dealer) {
    memory.addCoins(userId, bet * 2);
    result += `🎉 You win ${bet * 2} coins!`;
  } else if (player < dealer) {
    result += `😞 You lost ${bet} coins.`;
  } else {
    memory.addCoins(userId, bet);
    result += `🤝 Tie! Bet returned.`;
  }
  sock.sendMessage(msg.key.remoteJid, { text: result });
};

export const lottery = (sock, msg, args) => {
  const userId = msg.key.participant || msg.key.remoteJid;
  const bet = parseInt(args[0]);
  if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .lottery [bet]" });
  if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

  memory.removeCoins(userId, bet);
  const win = Math.random() < 0.05;
  if (win) {
    const prize = bet * 20;
    memory.addCoins(userId, prize);
    sock.sendMessage(msg.key.remoteJid, { text: `🎉 Jackpot! You won ${prize} coins!` });
  } else {
    sock.sendMessage(msg.key.remoteJid, { text: `🎫 No luck. Lost ${bet} coins.` });
  }
};

export const scratch = (sock, msg) => {
  const userId = msg.key.participant || msg.key.remoteJid;
  const cost = 200;
  if (memory.getWallet(userId) < cost) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

  memory.removeCoins(userId, cost);
  const reward = randInt(0, 1000);
  memory.addCoins(userId, reward);
  sock.sendMessage(msg.key.remoteJid, { text: `🃏 Scratch card result: ${reward} coins.` });
};

// Placeholder dummy games (betting logic)
export const crash = (sock, msg) => {
  sock.sendMessage(msg.key.remoteJid, { text: "⚡ Crash game coming soon!" });
};

export const wheel = (sock, msg) => {
  sock.sendMessage(msg.key.remoteJid, { text: "🎡 Wheel spin game coming soon!" });
};

export const keno = (sock, msg) => {
  sock.sendMessage(msg.key.remoteJid, { text: "🎰 Keno game coming soon!" });
};

export const poker = (sock, msg) => {
  sock.sendMessage(msg.key.remoteJid, { text: "♠️ Poker coming soon!" });
};

export const bingo = (sock, msg) => {
  sock.sendMessage(msg.key.remoteJid, { text: "🎉 Bingo coming soon!" });
};

export const bet = (sock, msg) => {
  sock.sendMessage(msg.key.remoteJid, { text: "💸 General bet coming soon!" });
};

export const jackpot = (sock, msg) => {
  sock.sendMessage(msg.key.remoteJid, { text: "💰 Jackpot event coming soon!" });
};