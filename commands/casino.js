import * as memory from './memory.js';

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default {
  wallet: (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const coins = memory.getWallet(userId);
    return sock.sendMessage(msg.key.remoteJid, { text: `💰 *Wallet Check*
You currently have *${coins}* shiny casino coins! 🪙
Try your luck with *.slot*, *.dice*, *.coinflip* and more!` });
  },

  daily: (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const reward = 500;
    memory.addCoins(userId, reward);
    return sock.sendMessage(msg.key.remoteJid, { text: `🎁 *Daily Bonus!*
You received *${reward}* free coins! 💸 Come back tomorrow for more luck!` });
  },

  slot: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "🎰 *Usage:* .slot [bet] - Place your bet to spin the magic machine!" });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "❌ You don't have enough coins to spin the slot!" });

    memory.removeCoins(userId, bet);

    const symbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "7️⃣"];
    const spin = [symbols[randInt(0, 5)], symbols[randInt(0, 5)], symbols[randInt(0, 5)]];
    let payout = 0;

    await sock.sendMessage(msg.key.remoteJid, { text: "🎰 *Spinning the slot machine...*\n🔄 [ ▫️ ▫️ ▫️ ]" });
    await new Promise(r => setTimeout(r, 1000));
    await sock.sendMessage(msg.key.remoteJid, { text: `🎰 Spinning...\n🔄 [ ${spin[0]} ▫️ ▫️ ]` });
    await new Promise(r => setTimeout(r, 800));
    await sock.sendMessage(msg.key.remoteJid, { text: `🎰 Spinning...\n🔄 [ ${spin[0]} ${spin[1]} ▫️ ]` });
    await new Promise(r => setTimeout(r, 800));
    await sock.sendMessage(msg.key.remoteJid, { text: `🎰 *Final Spin!*\n🎯 [ ${spin.join(' ')} ]` });

    let message = `🎰 *Slot Machine Result:*\n[ ${spin.join(' ')} ]\n`;
    if (spin[0] === spin[1] && spin[1] === spin[2]) {
      payout = bet * 5;
      message += `🎉 JACKPOT! Three ${spin[0]} matched! You win *${payout}* coins! 🪙🪙🪙`;
    } else if (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]) {
      payout = bet * 2;
      message += `✨ Two symbols matched! You win *${payout}* coins!`;
    } else {
      message += `😢 No matches. You lost *${bet}* coins. Better luck next time!`;
    }

    if (payout > 0) memory.addCoins(userId, payout);
    return sock.sendMessage(msg.key.remoteJid, { text: message });
  },

  coinflip: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "🪙 *Usage:* .coinflip [heads/tails] [bet] - Call it right to double your coins!" });

    const choice = args[0].toLowerCase();
    const bet = parseInt(args[1]);
    if (!['heads', 'tails'].includes(choice)) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Choose *heads* or *tails*!" });
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet amount." });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💰 You don't have enough coins." });

    memory.removeCoins(userId, bet);
    await sock.sendMessage(msg.key.remoteJid, { text: `🪙 Tossing the coin high into the air...\nYou called *${choice.toUpperCase()}*! Let's see...` });
    await new Promise(r => setTimeout(r, 1500));

    const result = Math.random() < 0.5 ? "heads" : "tails";
    let message = `🪙 The coin landed on *${result.toUpperCase()}*!
`;

    if (result === choice) {
      const win = bet * 2;
      memory.addCoins(userId, win);
      message += `🎉 You guessed right and won *${win}* coins! 🍀`;
    } else {
      message += `😢 You guessed wrong and lost *${bet}* coins.`;
    }

    return sock.sendMessage(msg.key.remoteJid, { text: message });
  },

  crash: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "💥 *Usage:* .crash [bet] - Try to cash out before the crash!" });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💰 Not enough coins." });

    memory.removeCoins(userId, bet);

    await sock.sendMessage(msg.key.remoteJid, { text: "🚀 *CRASH GAME STARTED!*\nMultiplier starts at x1.0! Hang tight..." });
    let multiplier = 1.0;
    let crashed = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000));
      multiplier += parseFloat((Math.random() * 0.8).toFixed(2));
      if (Math.random() < 0.2 || multiplier >= 5.0) {
        crashed = true;
        break;
      }
      await sock.sendMessage(msg.key.remoteJid, { text: `🚀 Multiplier: *x${multiplier.toFixed(2)}*` });
    }

    if (crashed) {
      return sock.sendMessage(msg.key.remoteJid, { text: `💥 *CRASHED!* at x${multiplier.toFixed(2)}! You lost *${bet}* coins.` });
    } else {
      const winnings = Math.floor(bet * multiplier);
      memory.addCoins(userId, winnings);
      return sock.sendMessage(msg.key.remoteJid, { text: `🤑 *You cashed out at x${multiplier.toFixed(2)}!*\nYou won *${winnings}* coins!` });
    }
  },

  horse: async (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "🐎 *Usage:* .horse [bet] - Bet on the fastest horse!" });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💰 Not enough coins." });

    const horses = ["🐎 Thunder", "🐎 Blaze", "🐎 Midnight", "🐎 Spirit"];
    const positions = [0, 0, 0, 0];
    memory.removeCoins(userId, bet);
    let message = "🏁 *The Horse Race Begins!* 🏁\n" + horses.map(h => `- ${h}`).join('\n');
    await sock.sendMessage(msg.key.remoteJid, { text: message });

    for (let step = 0; step < 6; step++) {
      await new Promise(r => setTimeout(r, 1000));
      const advancing = randInt(0, 3);
      positions[advancing]++;
      let raceVisual = horses.map((h, i) => `${h} ${"➡️".repeat(positions[i])}`).join('\n');
      await sock.sendMessage(msg.key.remoteJid, { text: `🏇 *Race Update:*\n${raceVisual}` });
    }

    const winnerIndex = positions.indexOf(Math.max(...positions));
    const winnerHorse = horses[winnerIndex];
    const prize = bet * 3;
    memory.addCoins(userId, prize);

    return sock.sendMessage(msg.key.remoteJid, { text: `🎉 *${winnerHorse} wins the race!* You earn *${prize}* coins! 🏆` });
  }
};