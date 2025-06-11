// casino.js

import memory from './memory.js';

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function sendAnimatedMessages(sock, jid, messages, delayTime = 1000) { for (const msg of messages) { await sock.sendMessage(jid, { text: msg }); await delay(delayTime); } }

export default { async slot(sock, msg, args) { const userId = msg.key.remoteJid; const bet = parseInt(args[0]); if (isNaN(bet) || bet <= 0) return await sock.sendMessage(userId, { text: '❌ Enter a valid bet amount.' }); if (!memory.hasCoins(userId, bet)) return await sock.sendMessage(userId, { text: '❌ You do not have enough coins.' });

const introMsgs = [
  '🎰 Welcome to the Slot Machine!',
  '💰 You pulled the lever...',
  '🎲 Spinning the reels...',
  '✨ Almost there...'
];
await sendAnimatedMessages(sock, userId, introMsgs);

const slots = ['🍒', '🍋', '🍊', '🔔', '⭐', '7️⃣'];
const result = [slots[randInt(0, 5)], slots[randInt(0, 5)], slots[randInt(0, 5)]];
const slotDisplay = `🎰 | ${result[0]} | ${result[1]} | ${result[2]} |`;

await sock.sendMessage(userId, { text: slotDisplay });

if (result[0] === result[1] && result[1] === result[2]) {
  const win = bet * 10;
  memory.addCoins(userId, win);
  await sock.sendMessage(userId, { text: `🎉 Jackpot! You won *${win}* coins!` });
} else {
  memory.removeCoins(userId, bet);
  await sock.sendMessage(userId, { text: `😢 You lost *${bet}* coins. Better luck next time!` });
}

},

async dice(sock, msg, args) { const userId = msg.key.remoteJid; const bet = parseInt(args[0]); if (isNaN(bet) || bet <= 0) return await sock.sendMessage(userId, { text: '❌ Enter a valid bet amount.' }); if (!memory.hasCoins(userId, bet)) return await sock.sendMessage(userId, { text: '❌ You do not have enough coins.' });

const introMsgs = [
  '🎲 Welcome to Dice Roll!',
  '🎯 Rolling your dice...',
  '⌛ Waiting for the result...',
  '🎉 Here it comes...'
];
await sendAnimatedMessages(sock, userId, introMsgs);

const roll = randInt(1, 6);
await sock.sendMessage(userId, { text: `🎲 You rolled a *${roll}*.` });

if (roll >= 5) {
  const win = bet * 2;
  memory.addCoins(userId, win);
  await sock.sendMessage(userId, { text: `🎉 You win! Gained *${win}* coins.` });
} else {
  memory.removeCoins(userId, bet);
  await sock.sendMessage(userId, { text: `😢 You lost *${bet}* coins.` });
}

},

async coinflip(sock, msg, args) { const userId = msg.key.remoteJid; const bet = parseInt(args[0]); if (isNaN(bet) || bet <= 0) return await sock.sendMessage(userId, { text: '❌ Enter a valid bet amount.' }); if (!memory.hasCoins(userId, bet)) return await sock.sendMessage(userId, { text: '❌ You do not have enough coins.' });

const introMsgs = [
  '🪙 Welcome to Coin Flip!',
  '🤞 Flipping the coin...',
  '🔄 It’s spinning in the air...',
  '📉 Let’s see what it lands on...'
];
await sendAnimatedMessages(sock, userId, introMsgs);

const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails';
await sock.sendMessage(userId, { text: `🪙 It landed on *${outcome}*!` });

if (outcome === 'Heads') {
  const win = bet * 2;
  memory.addCoins(userId, win);
  await sock.sendMessage(userId, { text: `🎉 You win *${win}* coins!` });
} else {
  memory.removeCoins(userId, bet);
  await sock.sendMessage(userId, { text: `😢 You lost *${bet}* coins.` });
}

},

async crash(sock, msg, args) { const userId = msg.key.remoteJid; const bet = parseInt(args[0]); if (isNaN(bet) || bet <= 0) return await sock.sendMessage(userId, { text: '❌ Enter a valid bet amount.' }); if (!memory.hasCoins(userId, bet)) return await sock.sendMessage(userId, { text: '❌ You do not have enough coins.' });

const introMsgs = [
  '🚀 Welcome to Crash Game!',
  '📈 The multiplier is rising...',
  '⏳ Hold your breath...',
  '💥 Will it crash or keep going?'
];
await sendAnimatedMessages(sock, userId, introMsgs);

const crashPoint = Math.random() * 10;
const userMultiplier = parseFloat((Math.random() * 5).toFixed(2));

await sock.sendMessage(userId, { text: `🚀 You cashed out at *${userMultiplier}x*! Crash was at *${crashPoint.toFixed(2)}x*.` });

if (userMultiplier < crashPoint) {
  const win = Math.floor(bet * userMultiplier);
  memory.addCoins(userId, win);
  await sock.sendMessage(userId, { text: `🎉 You win *${win}* coins!` });
} else {
  memory.removeCoins(userId, bet);
  await sock.sendMessage(userId, { text: `💥 Crashed before you could cash out. You lost *${bet}* coins.` });
}

},

async horse(sock, msg, args) { const userId = msg.key.remoteJid; const bet = parseInt(args[0]); if (isNaN(bet) || bet <= 0) return await sock.sendMessage(userId, { text: '❌ Enter a valid bet amount.' }); if (!memory.hasCoins(userId, bet)) return await sock.sendMessage(userId, { text: '❌ You do not have enough coins.' });

const introMsgs = [
  '🐎 Welcome to Horse Racing!',
  '🏇 The gates are opening...',
  '🔥 The race has started...',
  '🎽 Who will take the lead?'
];
await sendAnimatedMessages(sock, userId, introMsgs);

const horses = ['Thunder', 'Lightning', 'Blaze', 'Storm', 'Flash', 'Rocket'];
const winnerIndex = randInt(0, horses.length - 1);
const winner = horses[winnerIndex];

for (let i = 0; i < horses.length; i++) {
  await sock.sendMessage(userId, { text: `🏇 ${horses[i]} is running...` });
  await delay(1000);
}

await sock.sendMessage(userId, { text: `🏁 The winner is *${winner}*!` });

const winChance = Math.random();
if (winChance <= 1 / 6) {
  const winnings = bet * 5;
  memory.addCoins(userId, winnings);
  await sock.sendMessage(userId, { text: `🎉 Congratulations! You won *${winnings}* coins!` });
} else {
  memory.removeCoins(userId, bet);
  await sock.sendMessage(userId, { text: `😞 You lost *${bet}* coins. Better luck next time!` });
}

} };

