// Enhanced Interactive Casino Commands import * as memory from './memory.js';

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default { wallet: (sock, msg) => { const userId = msg.key.participant || msg.key.remoteJid; const coins = memory.getWallet(userId); return sock.sendMessage(msg.key.remoteJid, { text: 💼 *Your Wallet* You currently have *${coins}* shiny casino coins! 💰 }); },

daily: (sock, msg) => { const userId = msg.key.participant || msg.key.remoteJid; const reward = 500; memory.addCoins(userId, reward); return sock.sendMessage(msg.key.remoteJid, { text: 🎁 *Daily Bonus!* You opened your bonus chest and found *${reward}* coins! Come back tomorrow for more goodies! 🎉 }); },

// blackjack command blackjack: (sock, msg, args) => { const userId = msg.key.participant || msg.key.remoteJid; const bet = parseInt(args[0]); if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "🃏 Usage: .blackjack [bet] - Try to beat the dealer's hand!" }); if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "🚫 You don't have enough coins to place that bet!" });

memory.removeCoins(userId, bet);

const player = randInt(16, 21);
const dealer = randInt(15, 21);

let result = `🃏 *Blackjack Showdown!*

; result +=  👤 You drew: ${player} 🏦 Dealer drew: ${dealer}\n\n`;

if (player > dealer) {
  const winnings = bet * 2;
  memory.addCoins(userId, winnings);
  result += `🎉 *You win!* You've beaten the dealer and earned *${winnings}* coins! 🤑`;
} else if (player < dealer) {
  result += `😖 *You lost!* Dealer wins this round. You lost *${bet}* coins.`;
} else {
  memory.addCoins(userId, bet);
  result += `🤝 *It's a tie!* Your bet has been returned.`;
}

return sock.sendMessage(msg.key.remoteJid, { text: result });

},

roulette: (sock, msg, args) => { const userId = msg.key.participant || msg.key.remoteJid; if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: "🎡 Usage: .roulette [red/black/green/number] [bet] - Try your luck on the spinning wheel!" });

const choice = args[0].toLowerCase();
const bet = parseInt(args[1]);

if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "💸 Invalid bet amount." });
if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "🚫 Not enough coins to bet!" });

memory.removeCoins(userId, bet);

const spin = randInt(0, 36);
const color = spin === 0 ? 'green' : spin % 2 === 0 ? 'black' : 'red';
let message = `🎡 *Roulette Wheel Spins!*

The ball dances around the wheel... 🌀 It lands on ${spin} (${color.toUpperCase()})! \n`; let payout = 0;

if (["red", "black", "green"].includes(choice)) {
  if (choice === color) {
    payout = bet * (choice === 'green' ? 14 : 2);
    message += `🎯 You guessed the color correctly and win *${payout}* coins! 🎉`;
  } else {
    message += `❌ Wrong color! You lost *${bet}* coins.`;
  }
} else if (!isNaN(parseInt(choice))) {
  const guess = parseInt(choice);
  if (guess === spin) {
    payout = bet * 35;
    message += `💥 *JACKPOT!* You nailed the exact number and win *${payout}* coins! 🥳`;
  } else {
    message += `❌ Close, but not quite. You lost *${bet}* coins.`;
  }
} else {
  message += `❓ Invalid roulette bet.`;
}

if (payout > 0) memory.addCoins(userId, payout);
return sock.sendMessage(msg.key.remoteJid, { text: message });

},

scratch: (sock, msg) => { const userId = msg.key.participant || msg.key.remoteJid; const cost = 200; if (memory.getWallet(userId) < cost) return sock.sendMessage(msg.key.remoteJid, { text: "🎫 You need 200 coins to scratch the card." });

memory.removeCoins(userId, cost);
const reward = randInt(0, 1000);
memory.addCoins(userId, reward);

return sock.sendMessage(msg.key.remoteJid, { text: `🃏 *Scratch Card Game!*

You scratched the card... ✨ It reveals ${reward} coins! ${reward >= 500 ? '🔥 Lucky hit!' : '💨 Maybe next time!'}` }); },

crash: (sock, msg) => { const animation = [ "🚀 Launching...", "↗️ Climbing...", "⬆️ Higher and higher...", "⚠️ Crash incoming...", "💥 BOOM! The game crashed!" ]; const multiplier = (Math.random() * 10 + 1).toFixed(2); return sock.sendMessage(msg.key.remoteJid, { text: `🎮 Crash Game! ${animation.join('\n')}

📉 Final multiplier: ${multiplier}x 👀 More features coming soon! Stay tuned.` }); },

lottery: (sock, msg, args) => { const userId = msg.key.participant || msg.key.remoteJid; const bet = parseInt(args[0]); if (!bet || bet <= 0) return sock.sendMessage(msg.key.remoteJid, { text: "🎟️ Usage: .lottery [bet] - Try your luck in the jackpot!" }); if (memory.getWallet(userId) < bet) return sock.sendMessage(msg.key.remoteJid, { text: "🚫 You don't have enough coins." });

memory.removeCoins(userId, bet);
const win = Math.random() < 0.05;
const prize = bet * 20;
const result = win
  ? `🎉 *JACKPOT!* You hit the lucky number and won *${prize}* coins! 🥳`
  : `😢 No luck this time. You lost *${bet}* coins.`;

if (win) memory.addCoins(userId, prize);
return sock.sendMessage(msg.key.remoteJid, { text: result });

},

wheel: (sock, msg) => { const userId = msg.key.participant || msg.key.remoteJid; const cost = 100; if (memory.getWallet(userId) < cost) return sock.sendMessage(msg.key.remoteJid, { text: "🎡 You need 100 coins to spin the wheel." });

memory.removeCoins(userId, cost);
const segments = [0, 50, 100, 200, 500, 1000];
const result = segments[randInt(0, segments.length - 1)];
if (result > 0) memory.addCoins(userId, result);

return sock.sendMessage(msg.key.remoteJid, { text: `🎡 *Spinning the Fortune Wheel!*

The wheel spins... 🌀🌀🌀 It stops at ${result} coins! ${result > 0 ? '🎉 You win!' : '💤 Try again!'}` }); } };

