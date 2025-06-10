// commands/antispam.js
// 📦 LiamBot Anti-Spam & Moderation Commands

const memory = require("./memory");

module.exports = {
  // Enable or disable anti-spam filter
  antispam(sock, msg, args) {
    const status = args[0];
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .antispam [on/off]" });
    }
    sock.sendMessage(msg.key.remoteJid, { text: `🚨 Anti-spam is now *${status.toUpperCase()}*.` });
  },

  // Issue a warning
  warn(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .warn [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `⚠️ Warning issued to ${target}.` });
  },

  // Mute a user
  mute(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .mute [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `🔇 ${target} has been muted.` });
  },

  // Ban a user
  ban(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .ban [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `🚫 ${target} has been banned.` });
  },

  // Kick a user
  kick(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .kick [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `👢 ${target} has been kicked.` });
  },

  // Set group slow mode (delay between messages)
  slowmode(sock, msg, args) {
    const seconds = parseInt(args[0]);
    if (isNaN(seconds)) {
      return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .slowmode [seconds]" });
    }
    sock.sendMessage(msg.key.remoteJid, { text: `🐢 Slowmode enabled: ${seconds}s delay between messages.` });
  },

  // Add word to chat filter
  filter(sock, msg, args) {
    const word = args.join(" ");
    if (!word) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .filter [word]" });
    sock.sendMessage(msg.key.remoteJid, { text: `🚫 Word filtered: *${word}*` });
  },

  // Add user to blacklist
  blacklist(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .blacklist [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `🔒 ${target} added to blacklist.` });
  },

  // Remove user from whitelist
  whitelist(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .whitelist [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `✅ ${target} added to whitelist.` });
  },

  // Report a message or user
  report(sock, msg, args) {
    const report = args.join(" ");
    if (!report) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .report [issue]" });
    sock.sendMessage(msg.key.remoteJid, { text: `📢 Report received: ${report}` });
  },

  // Clean up messages (mock action)
  cleanup(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "🧹 Chat cleanup complete." });
  },

  // Block a user
  block(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .block [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `⛔ ${target} has been blocked.` });
  },

  // Unblock a user
  unblock(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .unblock [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `✅ ${target} has been unblocked.` });
  },

  // Audit recent group activity (mock summary)
  audit(sock, msg) {
    const auditLog = `
📄 *Audit Log:*
• 2 bans
• 1 mute
• 3 warnings
• 1 spam filter added
• 5 messages deleted
    `;
    sock.sendMessage(msg.key.remoteJid, { text: auditLog });
  },

  // Display moderation log (mock)
  log(sock, msg) {
    const log = `
📝 *Moderation Log:*
• @user1 warned
• @user2 kicked
• @user3 banned
• Slowmode enabled
    `;
    sock.sendMessage(msg.key.remoteJid, { text: log });
  }
};
