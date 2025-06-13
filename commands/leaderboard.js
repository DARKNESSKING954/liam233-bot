// commands/leaderboard.js
// 🏆 LiamBot Leaderboard Command — Top 5 Richest Players

import * as memory from '../memory.js';

export const leaderboard = async (sock, msg) => {
  const chatId = msg.key.remoteJid;

  // Fetch all users with coin balances
  const allUsers = memory.getAllWallets(); // { userId: coins, ... }

  if (!allUsers || Object.keys(allUsers).length === 0) {
    return sock.sendMessage(chatId, { text: "😔 No coin data found yet. Start playing to appear on the leaderboard!" });
  }

  // Sort users by coin amount in descending order
  const sorted = Object.entries(allUsers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5

  // Build fancy leaderboard text
  let leaderboardText = `🏆 *LiamBot Casino Leaderboard*\n\n`;
  const medals = ["🥇", "🥈", "🥉", "🏅", "🎖️"];

  sorted.forEach(([userId, coins], index) => {
    const tag = userId.split("@")[0];
    leaderboardText += `${medals[index]} *@${tag}* — 💰 *${coins.toLocaleString()} coins*\n`;
  });

  leaderboardText += `\n🔥 Keep playing to climb the ranks! Use *.daily*, *.slot*, *.coinflip* and more to earn coins.`

  // Send leaderboard with mentions
  const mentions = sorted.map(([userId]) => userId);

  await sock.sendMessage(chatId, {
    text: leaderboardText,
    mentions
  });
};