import * as memory from './memory.js';

// Helpers
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Main casino commands
export default {
  wallet: (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const coins = memory.getWallet(userId);
    return sock.sendMessage(msg.key.remoteJid, { text: `💰 *Wallet*\nYou have *${coins}* coins.` });
  },

  daily: (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const reward = 500;
    memory.addCoins(userId, reward);
    return sock.sendMessage(msg.key.remoteJid, { text: `🎉 Daily Reward! You received *${reward}* coins. Come back tomorrow!` });
  },

  slot: (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "🎰 Usage: *.slot [bet]* - Place your bet to spin the slots!" });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 You don't have enough coins." });

    memory.removeCoins(userId, bet);

    const symbols = ["🍒","🍋","🍊","🍉","⭐","7️⃣"];
    const spin = [symbols[randInt(0,5)], symbols[randInt(0,5)], symbols[randInt(0,5)]];
    let payout = 0;
    let message = `🎰 Spinning... [ ${spin.join(' ')} ]\n`;

    if (spin[0] === spin[1] && spin[1] === spin[2]) {
      payout = bet * 5;
      message += `🎉 JACKPOT! Three ${spin[0]}! You win *${payout}* coins!`;
    } else if (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]) {
      payout = bet * 2;
      message += `🙂 Two matching symbols! You win *${payout}* coins!`;
    } else {
      message += `😞 No match. You lost *${bet}* coins.`;
    }

    if (payout) memory.addCoins(userId, payout);
    return sock.sendMessage(msg.key.remoteJid, { text: message });
  },

  coinflip: (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "🪙 Usage: *.coinflip [heads/tails] [bet]* - Pick and bet!" });

    const choice = args[0].toLowerCase();
    const bet = parseInt(args[1]);

    if (!['heads','tails'].includes(choice)) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Pick heads or tails!" });
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet." });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💰 Not enough coins." });

    memory.removeCoins(userId, bet);
    const flip = Math.random() < 0.5 ? "heads" : "tails";
    let message = `🪙 Flipping the coin... It landed on *${flip.toUpperCase()}!*`;

    if (flip === choice) {
      memory.addCoins(userId, bet * 2);
      message += ` 🎉 You win *${bet}* coins!`;
    } else {
      message += ` 😞 You lost *${bet}* coins.`;
    }
    return sock.sendMessage(msg.key.remoteJid, { text: message });
  },

  dice: (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "🎲 Usage: *.dice [1-6] [bet]* - Guess the dice roll!" });

    const guess = parseInt(args[0]);
    const bet = parseInt(args[1]);
    if (guess < 1 || guess > 6) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Guess must be 1-6." });
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet." });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💰 Not enough coins." });

    memory.removeCoins(userId, bet);
    const roll = randInt(1,6);
    let message = `🎲 Rolling... It landed on *${roll}*.\n`;

    if (roll === guess) {
      const win = bet * 6;
      memory.addCoins(userId, win);
      message += `🎉 Amazing! You win *${win}* coins!`;
    } else {
      message += `😞 No luck. You lost *${bet}* coins.`;
    }
    return sock.sendMessage(msg.key.remoteJid, { text: message });
  },

  roulette: (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "🎡 Usage: *.roulette [red/black/green/number] [bet]* - Bet on color or number!" });

    const betType = args[0].toLowerCase();
    const bet = parseInt(args[1]);

    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet." });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💰 Not enough coins." });

    memory.removeCoins(userId, bet);

    const spin = randInt(0,36);
    const color = spin === 0 ? 'green' : spin % 2 === 0 ? 'black' : 'red';
    let message = `🎡 Wheel spins... It lands on *${spin}* (${color.toUpperCase()})!\n`;
    let payout = 0;

    if (['red','black','green'].includes(betType)) {
      if (color === betType) {
        payout = bet * (betType === 'green' ? 14 : 2);
        message += `🎉 You guessed the color! You win *${payout}* coins!`;
      } else {
        message += `😞 You lost *${bet}* coins.`;
      }
    } else {
      const numBet = parseInt(betType);
      if (numBet === spin) {
        payout = bet * 35;
        message += `🎉 JACKPOT! You guessed the number! You win *${payout}* coins!`;
      } else {
        message += `😞 No match. You lost *${bet}* coins.`;
      }
    }

    if (payout) memory.addCoins(userId, payout);
    return sock.sendMessage(msg.key.remoteJid, { text: message });
  },

  blackjack: (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "🃏 Usage: *.blackjack [bet]* - Beat the dealer!" });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

    memory.removeCoins(userId, bet);
    // Simple random hands
    const player = randInt(16,21);
    const dealer = randInt(15,21);
    let message = `🃏 Blackjack!\nYour hand: *${player}*\nDealer's hand: *${dealer}*\n`;

    if (player > dealer) {
      const win = bet * 2;
      memory.addCoins(userId, win);
      message += `🎉 You win! You earned *${win}* coins!`;
    } else if (player < dealer) {
      message += `😞 Dealer wins. You lost *${bet}* coins.`;
    } else {
      memory.addCoins(userId, bet);
      message += `🤝 It's a tie! Your bet is returned.`;
    }
    return sock.sendMessage(msg.key.remoteJid, { text: message });
  },

  lottery: (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "🎫 Usage: *.lottery [bet]* - Buy a ticket!" });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

    memory.removeCoins(userId, bet);
    if (Math.random() < 0.05) { // 5% chance
      const prize = bet * 20;
      memory.addCoins(userId, prize);
      return sock.sendMessage(msg.key.remoteJid, { text: `🎉 JACKPOT! You won *${prize}* coins!` });
    } else {
      return sock.sendMessage(msg.key.remoteJid, { text: `😞 No luck this time. You lost *${bet}* coins.` });
    }
  },

  scratch: (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const cost = 200;
    if (memory.getWallet(userId) < cost) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Scratch card costs 200 coins." });

    memory.removeCoins(userId, cost);
    const reward = randInt(0,1000);
    memory.addCoins(userId, reward);

    return sock.sendMessage(msg.key.remoteJid, { text: `🃏 Scratch card!\nYou revealed *${reward}* coins!` });
  },

  crash: (sock, msg) => {
    // Placeholder - can add interactive betting & multiplier logic later
    return sock.sendMessage(msg.key.remoteJid, { text: `⚡ Crash game is coming soon! Stay tuned for epic betting action! 🎮` });
  },

  wheel: (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (memory.getWallet(userId) < 100) return sock.sendMessage(msg.key.remoteJid, { text: "💸 You need 100 coins to spin the wheel." });

    memory.removeCoins(userId, 100);

    const segments = [0, 50, 100, 200, 500, 1000];
    const spinResult = segments[randInt(0, segments.length - 1)];

    if (spinResult > 0) memory.addCoins(userId, spinResult);

    return sock.sendMessage(msg.key.remoteJid, { text: `🎡 Spinning the wheel...\nYou won *${spinResult}* coins!` });
  }
};