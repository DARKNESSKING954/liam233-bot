import * as memory from './memory.js';

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default {
  // Wallet
  wallet: (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const coins = memory.getWallet(userId);
    return sock.sendMessage(msg.key.remoteJid, {
      text: `💰 *Wallet*
━━━━━━━━━━━━━━
You currently have *${coins}* coins in your wallet.`
    });
  },

  // Crash
  crash: async (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = 200;

    if (memory.getWallet(userId) < bet) {
      return sock.sendMessage(msg.key.remoteJid, { text: "💸 You need at least 200 coins to play Crash." });
    }

    memory.removeCoins(userId, bet);
    let multiplier = 1;
    let crashed = false;

    const interval = setInterval(() => multiplier += Math.random(), 300);

    await new Promise(resolve => setTimeout(resolve, 2000));
    clearInterval(interval);

    multiplier = Math.round(multiplier * 10) / 10;
    crashed = Math.random() < 0.5;

    let message = `🚀 *Crash Game Started!*
━━━━━━━━━━━━━━
You bet *${bet}* coins.

📈 Multiplier: x${multiplier}
`;

    if (!crashed) {
      const win = Math.floor(bet * multiplier);
      memory.addCoins(userId, win);
      message += `✅ You cashed out safely and won *${win}* coins!`;
    } else {
      message += `💥 The rocket crashed! You lost *${bet}* coins.`;
    }

    return sock.sendMessage(msg.key.remoteJid, { text: message });
  },

  // Coinflip
  coinflip: (sock, msg, args) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const choice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!['heads', 'tails'].includes(choice)) {
      return sock.sendMessage(msg.key.remoteJid, { text: "🪙 Usage: *.coinflip [heads/tails] [bet]*" });
    }
    if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet amount." });
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "💰 Not enough coins." });

    memory.removeCoins(userId, bet);

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    let message = `🪙 *Coinflip Game!*
━━━━━━━━━━━━━━
Your choice: *${choice.toUpperCase()}*
Flipping the coin... 🌀🌀🌀\n`;

    message += `It landed on *${result.toUpperCase()}*!\n`;
    if (result === choice) {
      memory.addCoins(userId, bet * 2);
      message += `🎉 You win *${bet}* coins!`;
    } else {
      message += `😢 You lost *${bet}* coins.`;
    }

    return sock.sendMessage(msg.key.remoteJid, { text: message });
  },

  // Horse Race
  horse: async (sock, msg) => {
    const userId = msg.key.participant || msg.key.remoteJid;
    const bet = 300;
    if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "🐴 You need 300 coins to enter the horse race." });

    memory.removeCoins(userId, bet);

    const horses = ['🐎 Thunder', '🐎 Blaze', '🐎 Storm'];
    const progress = [0, 0, 0];
    const finish = 5;
    let message = `🐎 *Horse Race Starts!*
━━━━━━━━━━━━━━
🏁 Horses: Thunder, Blaze, Storm
Bet: *${bet}* coins

`;

    while (progress.every(p => p < finish)) {
      for (let i = 0; i < 3; i++) progress[i] += randInt(0, 2);
      message += horses.map((h, i) => `${h}: ${'➖'.repeat(progress[i])}🏇`).join('\n') + '\n\n';
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const winnerIndex = progress.indexOf(Math.max(...progress));
    const winHorse = horses[winnerIndex].split(' ')[1];
    const winAmount = bet * 3;
    memory.addCoins(userId, winAmount);

    message += `🎉 *${horses[winnerIndex]} wins the race!*
You earned *${winAmount}* coins! 🏆`;

    return sock.sendMessage(msg.key.remoteJid, { text: message });
  }
};

