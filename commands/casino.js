import * as memory from './memory.js';

const delay = ms => new Promise(res => setTimeout(res, ms));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to send multiple messages with delay
async function sendAnimatedMessages(sock, jid, messages, delayMs = 2500) {
  for (const msg of messages) {
    await sock.sendMessage(jid, { text: msg });
    await delay(delayMs);
  }
}

export default {
  wallet: async (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const coins = memory.getWallet(userId);
    await sock.sendMessage(msg.key.remoteJid, { text: `💰 *Wallet*\nYou have *${coins}* coins.` });
  },

  daily: async (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const reward = 500;
    memory.addCoins(userId, reward);
    await sock.sendMessage(msg.key.remoteJid, { text: `🎉 Daily Reward! You received *${reward}* coins. Come back tomorrow!` });
  },

  slot: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) {
      await sock.sendMessage(msg.key.remoteJid, { text: "🎰 Usage: *.slot [bet]* - Place your bet to spin the slots!" });
      return;
    }
    if (memory.getWallet(userId) < bet) {
      await sock.sendMessage(msg.key.remoteJid, { text: "💸 You don't have enough coins." });
      return;
    }

    memory.removeCoins(userId, bet);
    const symbols = ["🍒","🍋","🍊","🍉","⭐","7️⃣"];

    // Intro animation messages
    const introMsgs = [
      `🎰 Welcome to the Slots! You bet *${bet}* coins.`,
      `Spinning the reels... 🎡🎡🎡`,
      `The slots are moving: 🍒 🍋 🍊 ...`,
      `Will luck be on your side? Let's see...`
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    // Simulate spinning effect (randomized)
    const spin1 = symbols[randInt(0, symbols.length - 1)];
    await sock.sendMessage(msg.key.remoteJid, { text: `🎰 Reels stop one by one...\n[ ${spin1} ❓ ❓ ]` });
    await delay(1500);
    const spin2 = symbols[randInt(0, symbols.length - 1)];
    await sock.sendMessage(msg.key.remoteJid, { text: `🎰 Reels stop one by one...\n[ ${spin1} ${spin2} ❓ ]` });
    await delay(1500);
    const spin3 = symbols[randInt(0, symbols.length - 1)];
    const spin = [spin1, spin2, spin3];
    await sock.sendMessage(msg.key.remoteJid, { text: `🎰 Final result:\n[ ${spin.join(' ')} ]` });

    let payout = 0;
    let resultMsg = '';
    if (spin[0] === spin[1] && spin[1] === spin[2]) {
      payout = bet * 5;
      resultMsg = `🎉 JACKPOT! Three *${spin[0]}* in a row! You win *${payout}* coins!`;
    } else if (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]) {
      payout = bet * 2;
      resultMsg = `🙂 Nice! Two matching symbols! You win *${payout}* coins!`;
    } else {
      resultMsg = `😞 No luck this time. You lost *${bet}* coins.`;
    }

    if (payout) memory.addCoins(userId, payout);
    await sock.sendMessage(msg.key.remoteJid, { text: resultMsg });
  },

  coinflip: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (args.length < 2) {
      await sock.sendMessage(msg.key.remoteJid, { text: "🪙 Usage: *.coinflip [heads/tails] [bet]* - Pick and bet!" });
      return;
    }

    const choice = args[0].toLowerCase();
    const bet = parseInt(args[1]);

    if (!['heads', 'tails'].includes(choice)) {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ You must pick 'heads' or 'tails'!" });
      return;
    }
    if (!bet || bet <= 0) {
      await sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet amount." });
      return;
    }
    if (memory.getWallet(userId) < bet) {
      await sock.sendMessage(msg.key.remoteJid, { text: "💰 You don't have enough coins." });
      return;
    }

    memory.removeCoins(userId, bet);

    // Intro animation messages
    const introMsgs = [
      `🪙 Welcome to the Coin Flip! You bet *${bet}* coins on *${choice}*.`,
      `Flipping the coin in the air...`,
      `Spinning... Heads or tails? 🤔`,
      `The coin is about to land...`
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    const flip = Math.random() < 0.5 ? "heads" : "tails";
    const resultMsg = `🪙 The coin landed on *${flip.toUpperCase()}!*`;

    if (flip === choice) {
      const winnings = bet * 2;
      memory.addCoins(userId, winnings);
      await sock.sendMessage(msg.key.remoteJid, { text: `${resultMsg} 🎉 You win *${bet}* coins!` });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: `${resultMsg} 😞 You lost *${bet}* coins.` });
    }
  },

  dice: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (args.length < 2) {
      await sock.sendMessage(msg.key.remoteJid, { text: "🎲 Usage: *.dice [1-6] [bet]* - Guess the dice roll!" });
      return;
    }

    const guess = parseInt(args[0]);
    const bet = parseInt(args[1]);

    if (guess < 1 || guess > 6) {
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Your guess must be a number between 1 and 6." });
      return;
    }
    if (!bet || bet <= 0) {
      await sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet amount." });
      return;
    }
    if (memory.getWallet(userId) < bet) {
      await sock.sendMessage(msg.key.remoteJid, { text: "💰 You don't have enough coins." });
      return;
    }

    memory.removeCoins(userId, bet);

    const introMsgs = [
      `🎲 Welcome to Dice! You guessed *${guess}* and bet *${bet}* coins.`,
      `Rolling the dice... 🎲🎲`,
      `The dice is bouncing...`,
      `Let's see where it lands!`
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    const roll = randInt(1, 6);
    await sock.sendMessage(msg.key.remoteJid, { text: `🎲 The dice rolled a *${roll}*.` });

    if (roll === guess) {
      const winAmount = bet * 6;
      memory.addCoins(userId, winAmount);
      await sock.sendMessage(msg.key.remoteJid, { text: `🎉 Amazing! You guessed right and won *${winAmount}* coins!` });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: `😞 No luck. You lost *${bet}* coins.` });
    }
  },

  roulette: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (args.length < 2) {
      await sock.sendMessage(msg.key.remoteJid, { text: "🎡 Usage: *.roulette [red/black/green/number] [bet]* - Bet on color or number!" });
      return;
    }

    const betType = args[0].toLowerCase();
    const bet = parseInt(args[1]);

    if (!bet || bet <= 0) {
      await sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet amount." });
      return;
    }
    if (memory.getWallet(userId) < bet) {
      await sock.sendMessage(msg.key.remoteJid, { text: "💰 You don't have enough coins." });
      return;
    }

    memory.removeCoins(userId, bet);

    const introMsgs = [
      `🎡 Welcome to Roulette! You bet *${bet}* coins on *${betType}*.`,
      `Spinning the wheel... 🌀`,
      `The ball is bouncing...`,
      `And it's about to land!`
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    const spin = randInt(0, 36);
    const color = spin === 0 ? 'green' : spin % 2 === 0 ? 'black' : 'red';

    await sock.sendMessage(msg.key.remoteJid, { text: `🎡 The wheel stopped at *${spin}* (${color.toUpperCase()})!` });

    let payout = 0;
    let resultMsg = '';

    if (['red', 'black', 'green'].includes(betType)) {
      if (color === betType) {
        payout = bet * (betType === 'green' ? 14 : 2);
        resultMsg = `🎉 You guessed the color! You win *${payout}* coins!`;
      } else {
        resultMsg = `😞 Sorry, you lost *${bet}* coins.`;
      }
    } else {
      // Bet on number
      const betNumber = parseInt(betType);
      if (betNumber === spin) {
        payout = bet * 35;
        resultMsg = `🎉 You guessed the exact number! You win *${payout}* coins!`;
      } else {
        resultMsg = `😞 No luck, the number was *${spin}*. You lost *${bet}* coins.`;
      }
    }

    if (payout) memory.addCoins(userId, payout);
    await sock.sendMessage(msg.key.remoteJid, { text: resultMsg });
  },

  crash: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) {
      await sock.sendMessage(msg.key.remoteJid, { text: "🚀 Usage: *.crash [bet]* - Bet and cash out before crash!" });
      return;
    }
    if (memory.getWallet(userId) < bet) {
      await sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins to bet." });
      return;
    }

    memory.removeCoins(userId, bet);

    const introMsgs = [
      `🚀 Welcome to Crash! You bet *${bet}* coins.`,
      `The multiplier is rising...`,
      `Cash out before it crashes! ⏳`,
      `Brace yourself!`
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    // Simulate crash multiplier between 1.0 and 10.0
    const crashPoint = (Math.random() * 9 + 1).toFixed(2);

    // User auto cashout between 1.0 and crashPoint-0.5
    const cashout = (Math.random() * (crashPoint - 0.5) + 1).toFixed(2);

    if (parseFloat(cashout) >= parseFloat(crashPoint)) {
      await sock.sendMessage(msg.key.remoteJid, { text: `💥 CRASH at ${crashPoint}x! You didn't cash out in time and lost *${bet}* coins.` });
    } else {
      const winnings = Math.floor(bet * cashout);
      memory.addCoins(userId, winnings);
      await sock.sendMessage(msg.key.remoteJid, { text: `💰 You cashed out at ${cashout}x multiplier and won *${winnings}* coins!` });
    }
  },

  horse: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) {
      await sock.sendMessage(msg.key.remoteJid, { text: "🐎 Usage: *.horse [bet]* - Bet on a horse race!" });
      return;
    }
    if (memory.getWallet(userId) < bet) {
      await sock.sendMessage(msg.key.remoteJid, { text: "💸 You don't have enough coins." });
      return;
    }

    memory.removeCoins(userId, bet);

    const horses = ["🐎Lightning", "🐎Thunder", "🐎Blaze", "🐎Storm", "🐎Rocket", "🐎Shadow"];
    const introMsgs = [
      `🐎 Welcome to the Horse Race! You bet *${bet}* coins.`,
      `The horses are lining up...`,
      `They're off! 🏇🏇🏇`,
      `Who's going to win?`
    ];
await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    // Randomly pick winner
    const winnerIndex = randInt(0, horses.length - 1);
    const winner = horses[winnerIndex];

    // Simulate suspense with progressive messages
    for (let i = 0; i < horses.length; i++) {
      await sock.sendMessage(msg.key.remoteJid, { text: `🏇 ${horses[i]} is running...` });
      await delay(1000);
    }

    await sock.sendMessage(msg.key.remoteJid, { text: `🏆 The winner is... *${winner}*!` });

    // User wins if their chosen horse matches winner - but since no user choice, random chance 1/6
    // To make it fair, 1/6 chance to win 5x bet, else lose bet
    const winChance = Math.random();
    if (winChance <= 1/6) {
      const winnings = bet * 5;
      memory.addCoins(userId, winnings);
      await sock.sendMessage(msg.key.remoteJid, { text: `🎉 Congratulations! You won *${winnings}* coins!` });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: `😞 Better luck next time. You lost *${bet}* coins.` });
    }
  }
};