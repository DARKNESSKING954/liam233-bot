// commands/leaderboard.js
// 🏆 LiamBot Leaderboard Command — Top 5 Richest Players

import * as memory from '../memory.js';

export const leaderboard = async (sock, msg) => {
  const chatId = msg.key.remoteJid;

  // Fetch all users with coin balances
  const allUsers = memory.getAllWallets(); // { userId: coins, ... }

  if (!allUsers || Object.keys(allUsers).length === 0) {
    return sock.sendMessage(chatId, {
      text: "😔 No coin data yet. Use *.daily* and *.horse* to start earning coins!",
    });
  }

  // Sort users by coin amount in descending order
  const sorted = Object.entries(allUsers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 only

  // Build leaderboard text
  const medals = ["🥇", "🥈", "🥉", "🏅", "🎖️"];
  let leaderboardText = `🏆 *LiamBot Casino Leaderboard*\n\n`;

  sorted.forEach(([userId, coins], index) => {
    const tag = userId.split("@")[0];
    leaderboardText += `${index + 1}. ${medals[index]} *@${tag}* — 💰 *${coins.toLocaleString()} coins*\n`;
  });

  leaderboardText += `\n📈 Use *.daily* and *.horse* to climb the ranks!`;

  // Send leaderboard with mentions
  const mentions = sorted.map(([userId]) => userId);

  await sock.sendMessage(chatId, {
    text: leaderboardText.trim(),
    mentions,
  });
};