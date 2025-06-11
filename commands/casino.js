import * as memory from './memory.js';

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function sendAnimatedMessages(sock, jid, messages, delayMs = 1500) {
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
    await sock.sendMessage(msg.key.remoteJid, { text: `🎉 Daily Reward!\nYou just got *${reward}* coins! Come back tomorrow for more!` });
  },

  slot: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "🎰 Usage: *.slot [bet]* - Place your bet to spin the slots!" });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 You don't have enough coins." });

    memory.removeCoins(userId, bet);

    const introMsgs = [
      `🎰 Welcome to the Slot Machine! Your bet: *${bet}* coins.`,
      "🔄 Spinning the reels... The wheels start to whirl! 🍒🍋🍊🍉⭐7️⃣",
      "⌛ The symbols are lining up... Will luck be on your side?",
      "🎉 Here we go! Let's see the result!"
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    const symbols = ["🍒","🍋","🍊","🍉","⭐","7️⃣"];
    const spin = [symbols[randInt(0,5)], symbols[randInt(0,5)], symbols[randInt(0,5)]];

    let payout = 0;
    let resultMsg = `🎰 Result: [ ${spin.join(' ')} ]\n`;

    if (spin[0] === spin[1] && spin[1] === spin[2]) {
      payout = bet * 5;
      resultMsg += `🎉 JACKPOT! Three ${spin[0]}! You win *${payout}* coins!`;
    } else if (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]) {
      payout = bet * 2;
      resultMsg += `🙂 Two matching symbols! You win *${payout}* coins!`;
    } else {
      resultMsg += `😞 No match. You lost *${bet}* coins.`;
    }

    if (payout) memory.addCoins(userId, payout);
    await sock.sendMessage(msg.key.remoteJid, { text: resultMsg });
  },

  coinflip: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "🪙 Usage: *.coinflip [heads/tails] [bet]* - Pick your side and bet!" });

    const choice = args[0].toLowerCase();
    const bet = parseInt(args[1]);

    if (!['heads','tails'].includes(choice)) return sock.sendMessage(msg.key.remoteJid, { text: "❌ You must pick either heads or tails!" });
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet amount." });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💰 You don’t have enough coins." });

    memory.removeCoins(userId, bet);

    const introMsgs = [
      `🪙 Coin Flip time! You bet *${bet}* coins on *${choice.toUpperCase()}*.`,
      "🔄 Flipping the coin... It spins through the air... 🌪️",
      "⌛ The coin is about to land...",
      "👀 Drumroll please..."
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    const flip = Math.random() < 0.5 ? "heads" : "tails";
    let resultMsg = `🪙 The coin landed on *${flip.toUpperCase()}!*`;

    if (flip === choice) {
      memory.addCoins(userId, bet * 2);
      resultMsg += ` 🎉 You win *${bet}* coins!`;
    } else {
      resultMsg += ` 😞 You lost *${bet}* coins.`;
    }
    await sock.sendMessage(msg.key.remoteJid, { text: resultMsg });
  },

  dice: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "🎲 Usage: *.dice [1-6] [bet]* - Guess the dice roll!" });

    const guess = parseInt(args[0]);
    const bet = parseInt(args[1]);
    if (guess < 1 || guess > 6) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Your guess must be between 1 and 6." });
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet." });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💰 Not enough coins." });

    memory.removeCoins(userId, bet);

    const introMsgs = [
      `🎲 Dice game! You bet *${bet}* coins and guessed *${guess}*.`,
      "🎲 Rolling the dice... The cube tumbles... 🎲",
      "⌛ Almost there... The dice slows down...",
      "👀 And the dice lands!"
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    const roll = randInt(1,6);
    let resultMsg = `🎲 It landed on *${roll}*.\n`;

    if (roll === guess) {
      const win = bet * 6;
      memory.addCoins(userId, win);
      resultMsg += `🎉 Amazing! You guessed right and win *${win}* coins!`;
    } else {
      resultMsg += `😞 No luck this time. You lost *${bet}* coins.`;
    }
    await sock.sendMessage(msg.key.remoteJid, { text: resultMsg });
  },

  roulette: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "🎡 Usage: *.roulette [red/black/green/number] [bet]* - Bet on a color or number!" });

    const betType = args[0].toLowerCase();
    const bet = parseInt(args[1]);

    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet amount." });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💰 Not enough coins." });

    memory.removeCoins(userId, bet);

    const introMsgs = [
      `🎡 Welcome to Roulette! You bet *${bet}* coins on *${betType}*.`,
      "🎡 Spinning the roulette wheel... It whirls around... 🔴⚫🟢",
      "⌛ The ball is bouncing... Where will it land?",
      "👀 The ball is about to stop!"
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    const spin = randInt(0,36);
    const color = spin === 0 ? 'green' : spin % 2 === 0 ? 'black' : 'red';
    let resultMsg = `🎡 The wheel stops at *${spin}* (${color.toUpperCase()})!\n`;

    let payout = 0;

    if (['red','black','green'].includes(betType)) {
      if (color === betType) {
        payout = bet * (betType === 'green' ? 14 : 2);
        resultMsg += `🎉 You guessed the color right! You win *${payout}* coins!`;
      } else {
        resultMsg += `😞 Wrong color. You lost *${bet}* coins.`;
      }
    } else {
      const numBet = parseInt(betType);
      if (numBet === spin) {
        payout = bet * 35;
        resultMsg += `🎉 JACKPOT! You guessed the number! You win *${payout}* coins!`;
      } else {
        resultMsg += `😞 No match. You lost *${bet}* coins.`;
      }
    }

    if (payout) memory.addCoins(userId, payout);
    await sock.sendMessage(msg.key.remoteJid, { text: resultMsg });
  },

  blackjack: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "🃏 Usage: *.blackjack [bet]* - Try to beat the dealer!" });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

    memory.removeCoins(userId, bet);

    const introMsgs = [
      `🃏 Blackjack time! You bet *${bet}* coins.`,
      "🃏 Dealing cards... Your hand and the dealer's hand...",
      "⌛ Counting the cards... Who will win?",
      "👀 Let's reveal the hands!"
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    const player = randInt(16,21);
    const dealer = randInt(15,21);

    let resultMsg = `🃏 Your hand: *${player}*\nDealer's hand: *${dealer}*\n`;

    if (player > dealer) {
      const win = bet * 2;
      memory.addCoins(userId, win);
      resultMsg += `🎉 You win! You earned *${win}* coins!`;
    } else if (player < dealer) {
      resultMsg += `😞 Dealer wins. You lost *${bet}* coins.`;
    } else {
      memory.addCoins(userId, bet);
      resultMsg += `🤝 It's a tie! Your bet is returned.`;
    }
    await sock.sendMessage(msg.key.remoteJid, { text: resultMsg });
  },

  lottery: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "🎫 Usage: *.lottery [bet]* - Buy a lottery ticket!" });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Not enough coins." });

    memory.removeCoins(userId, bet);

    const introMsgs = [
      `🎫 Lottery time! You bought a ticket for *${bet}* coins.`,
      "🎫 The lottery drum spins... Tickets swirl inside...",
      "⌛ The winning ticket is about to be drawn...",
      "👀 And the winning number is..."
    ];
    await sendAnimatedMessages(sock, msg.key.remoteJid, introMsgs);

    // 5% chance to win 10x bet
    if (Math.random() < 0.05) {
      const winnings = bet * 10;
      memory.addCoins(userId, winnings);
      await sock.sendMessage(msg.key.remoteJid, { text: `🎉 Congratulations! Your ticket won *${winnings}* coins!` });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: `😞 Sorry, no luck this time. You lost *${bet}* coins.` });
    }
  }
};