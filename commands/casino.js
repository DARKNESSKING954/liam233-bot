import { getWallet, addCoins, removeCoins } from '../memory.js';
import { getUserId } from '../utils.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatCoins(amount) {
  return `💰 ${amount.toLocaleString()} coins`;
}

// 💳 Funny interactive wallet command — fully fixed to send styled text + mention user
async function wallet(sock, msg) {
  const user = getUserId(msg);
  const from = msg.key.remoteJid;
  const coins = getWallet(user);

  const userTag = msg.key.participant || user;

  const walletMsg = `
👜 *LiamBot Wallet* 👜
———————————————
👤 User: @${user.split('@')[0]}

${coins === 1000
    ? `💵 Starting balance: *${formatCoins(coins)}* (fresh out the gate!)`
    : `💵 Balance: *${formatCoins(coins)}*`}

⚠️ Remember, this is the only coins you get. Go broke? That's on you! 😎

🎲 Ready to gamble and become the next Andrew Tate?  
🚗💨 *"Take risks, or stay broke."* — LiamBot wisdom

${coins < 500 ? '😬 Low balance alert! Time to hustle or beg!' : '🔥 Keep stacking those coins!'}
`;

  await sock.sendMessage(from, {
    text: walletMsg.trim(),
    mentions: [userTag],
  });
}

// 🏦 Give coins to another user
async function give(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = getUserId(msg);

  if (args.length < 2) {
    return sock.sendMessage(from, {
      text: '❗ Usage: .give @user [amount]\nExample: .give @1234567890 500',
    });
  }

  let targetMention = args[0];
  if (!targetMention.startsWith('@')) {
    return sock.sendMessage(from, {
      text: '❗ Please mention a user like @1234567890',
    });
  }

  // Remove @ and add WhatsApp suffix if missing
  const targetUser = targetMention.slice(1).includes('@') ? targetMention.slice(1) : `${targetMention.slice(1)}@s.whatsapp.net`;

  const amount = parseInt(args[1]);
  if (isNaN(amount) || amount <= 0) {
    return sock.sendMessage(from, {
      text: '❗ Invalid amount! Please enter a positive number.',
    });
  }

  const senderBalance = getWallet(sender);
  if (amount > senderBalance) {
    return sock.sendMessage(from, {
      text: `❌ You don’t have enough coins. Your balance: ${formatCoins(senderBalance)}`,
    });
  }

  if (sender === targetUser) {
    return sock.sendMessage(from, {
      text: `🤨 Trying to give coins to yourself? Nice try!`,
    });
  }

  // Transfer coins
  removeCoins(sender, amount);
  addCoins(targetUser, amount);

  const senderNewBalance = getWallet(sender);

  const giveMsg = `
💸 *LiamBot Transfer* 💸

👤 *You* gave *${formatCoins(amount)}* to @${targetUser.split('@')[0]}!

🔄 Your new balance: ${formatCoins(senderNewBalance)}

${senderNewBalance < 500 ? '⚠️ Low balance, hustle harder!' : '💪 Keep those coins flowing!'}
`;

  await sock.sendMessage(from, {
    text: giveMsg.trim(),
    mentions: [targetUser, sender],
  });
}

// 🐴 Horse game
async function horse(sock, msg, args) {
  const user = getUserId(msg);
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0 || isNaN(pick) || pick < 1 || pick > 5)
    return sock.sendMessage(from, {
      text: '❗ Usage: .horse <amount> <horse number (1-5)>',
    });

  const balance = getWallet(user);
  if (bet > balance)
    return sock.sendMessage(from, {
      text: `❌ Not enough coins. You have: ${formatCoins(balance)}`,
    });

  // 🎉 Hype build-up messages
  await sock.sendMessage(from, { text: '🏇 Horses are warming up!' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🐴 Stretching legs on the track...' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '📢 Crowd is roaring! Place your bets!' });
  await sleep(1000);
  await sock.sendMessage(from, { text: '🏁 The race begins!' });
  await sleep(1000);

  const positions = [0, 0, 0, 0, 0];

  for (let i = 0; i < 20; i++) {
    const advance = Math.floor(Math.random() * 5);
    positions[advance]++;

    const raceVisual = positions
      .map((pos, idx) => '─'.repeat(pos) + `🏇 Horse ${idx + 1}`)
      .join('\n');

    await sock.sendMessage(from, { text: `📊 Race Progress:\n\n${raceVisual}` });
    await sleep(400);
  }

  const max = Math.max(...positions);
  const winners = positions
    .map((val, idx) => ({ pos: val, idx }))
    .filter(h => h.pos === max)
    .map(h => h.idx + 1);

  const winner = winners[Math.floor(Math.random() * winners.length)];

  await sock.sendMessage(from, {
    text: `🏁 The race is over! Winner: 🏇 Horse ${winner}`,
  });

  // 🎉 Post-race commentary
  await sock.sendMessage(from, { text: `🎤 What a finish! The crowd is going wild!` });
  await sleep(700);
  await sock.sendMessage(from, { text: `📦 Counting the coins...` });
  await sleep(700);
  await sock.sendMessage(from, { text: `📣 Let's reveal the result...` });

  if (pick === winner) {
    addCoins(user, bet * 2);
    await sock.sendMessage(from, {
      text: `🎉 You won ${formatCoins(bet * 2)}!`,
    });
  } else {
    removeCoins(user, bet);
    await sock.sendMessage(from, {
      text: `😢 You lost ${formatCoins(bet)}. Better luck next time!`,
    });
  }
}

export default {
  wallet,
  give,
  horse,
};