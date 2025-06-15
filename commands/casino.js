import { getWallet, addCoins, removeCoins, getLastDaily, setLastDaily } from '../memory.js';
import { getUserId } from '../utils.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatCoins(amount) {
  return `💰 ${amount.toLocaleString()} coins`;
}

// 💼 WALLET
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

// 💸 GIVE
async function give(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = getUserId(msg);

  const mentionedUsers = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentionedUsers.length === 0 || args.length < 2) {
    return sock.sendMessage(from, {
      text: '❗ Usage: .give @user [amount]\nPlease *tag* the user properly in the message (select contact and mention).',
    });
  }

  const targetUser = mentionedUsers[0];
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

// 🐴 HORSE (Tougher Odds ~25%)
async function horse(sock, msg, args) {
  const user = getUserId(msg);
  const from = msg.key.remoteJid;
  const bet = parseInt(args[0]);
  const pick = parseInt(args[1]);

  if (isNaN(bet) || bet <= 0 || isNaN(pick) || pick < 1 || pick > 5) {
    return sock.sendMessage(from, {
      text: '❗ Usage: .horse <amount> <horse number (1-5)>',
    });
  }

  const balance = getWallet(user);
  if (bet > balance) {
    return sock.sendMessage(from, {
      text: `❌ Not enough coins. You have: ${formatCoins(balance)}`,
    });
  }

  const hypeMessages = [
    '🏇 Get ready! The horses are at the starting gate!',
    '🔥 The crowd is hyped, the tension is building!',
    '🎯 Which horse will claim victory today? Place your bets!',
    '⚡ The energy is electric! This race will be unforgettable!',
  ];

  for (const msgText of hypeMessages) {
    await sock.sendMessage(from, { text: msgText });
    await sleep(1000);
  }

  await sock.sendMessage(from, { text: '🏁 The race begins!' });
  await sleep(1000);

  const positions = [0, 0, 0, 0, 0];

  for (let i = 0; i < 20; i++) {
    const weightedAdvance = Math.random();

    let advance;
    if (weightedAdvance < 0.25) {
      advance = pick - 1;
    } else {
      const otherHorses = [0, 1, 2, 3, 4].filter(h => h !== pick - 1);
      advance = otherHorses[Math.floor(Math.random() * otherHorses.length)];
    }

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

  const postRaceMessages = [
    `🏁 The race is over! Winner: 🏇 Horse ${winner}`,
    '🎤 What a finish! The crowd is going wild!',
    '📦 Counting the coins...',
    "📣 Let's reveal the result...",
  ];

  for (const msgText of postRaceMessages) {
    await sock.sendMessage(from, { text: msgText });
    await sleep(700);
  }

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

// 🎁 DAILY
async function daily(sock, msg) {
  const from = msg.key.remoteJid;
  const user = getUserId(msg);
  const userTag = msg.key.participant || user;

  const lastClaim = new Date(getLastDaily(user));
  const now = new Date();
  const diffMs = now - lastClaim;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    const remainingMs = 24 * 60 * 60 * 1000 - diffMs;
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    return sock.sendMessage(from, {
      text: `⏳ You already claimed your daily coins!\nCome back in *${hours}h ${minutes}m ${seconds}s*.`,
      mentions: [userTag]
    });
  }

  const reward = 500;
  addCoins(user, reward);
  setLastDaily(user, now.toISOString());

  await sock.sendMessage(from, {
    text: `🎁 *Daily Reward Claimed!*\n\n@${user.split('@')[0]} received *${formatCoins(reward)}*!\n\nCome back in 24 hours for more coins.`,
    mentions: [userTag],
  });
}

export default {
  wallet,
  give,
  horse,
  daily,
};