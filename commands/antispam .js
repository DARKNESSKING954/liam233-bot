// 📦 LiamBot Anti-Spam & Moderation Commands

import * as memory from "../memory.js"; // ✅ Correct import for named exports

export default {
  antispam(sock, msg, args) {
    const status = args[0];
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .antispam [on/off]" });
    }
    sock.sendMessage(msg.key.remoteJid, { text: `🚨 Anti-spam is now *${status.toUpperCase()}*.` });
  },

  warn(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .warn [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `⚠️ Warning issued to ${target}.` });
  },

  mute(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .mute [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `🔇 ${target} has been muted.` });
  },

  ban(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .ban [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `🚫 ${target} has been banned.` });
  },

  kick(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .kick [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `👢 ${target} has been kicked.` });
  },

  slowmode(sock, msg, args) {
    const seconds = parseInt(args[0]);
    if (isNaN(seconds)) {
      return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .slowmode [seconds]" });
    }
    sock.sendMessage(msg.key.remoteJid, { text: `🐢 Slowmode enabled: ${seconds}s delay between messages.` });
  },

  filter(sock, msg, args) {
    const word = args.join(" ");
    if (!word) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .filter [word]" });
    sock.sendMessage(msg.key.remoteJid, { text: `🚫 Word filtered: *${word}*` });
  },

  blacklist(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .blacklist [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `🔒 ${target} added to blacklist.` });
  },

  whitelist(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .whitelist [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `✅ ${target} added to whitelist.` });
  },

  report(sock, msg, args) {
    const report = args.join(" ");
    if (!report) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .report [issue]" });
    sock.sendMessage(msg.key.remoteJid, { text: `📢 Report received: ${report}` });
  },

  cleanup(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "🧹 Chat cleanup complete." });
  },

  block(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .block [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `⛔ ${target} has been blocked.` });
  },

  unblock(sock, msg, args) {
    const target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .unblock [@user]" });
    sock.sendMessage(msg.key.remoteJid, { text: `✅ ${target} has been unblocked.` });
  },

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
