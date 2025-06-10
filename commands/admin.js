// commands/admin.js
// Admin commands for managing group and users

/**
 * Helper: Check if user is group admin
 * @param {object} sock - WhatsApp connection instance
 * @param {string} jid - group chat ID
 * @param {string} userId - user ID to check
 * @returns {Promise<boolean>}
 */
async function isAdmin(sock, jid, userId) {
  try {
    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants || [];
    const user = participants.find(p => p.id === userId);
    return user && (user.admin === "admin" || user.admin === "superadmin");
  } catch {
    return false;
  }
}

/**
 * Extract mentioned user(s) from message
 * @param {object} msg 
 * @returns {string[]} user IDs
 */
function getMentionedUsers(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

module.exports = {
  /**
   * Ban user (kick + add to blacklist)
   */
  async ban(sock, msg) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!await isAdmin(sock, jid, sender)) {
      return sock.sendMessage(jid, { text: "❌ You must be an admin to use this command." });
    }

    const toBan = getMentionedUsers(msg);
    if (toBan.length === 0) {
      return sock.sendMessage(jid, { text: "Please mention user(s) to ban." });
    }

    try {
      await sock.groupRemove(jid, toBan);
      // Optional: Add banned users to blacklist here
      await sock.sendMessage(jid, { text: `✅ Banned user(s): ${toBan.join(", ")}` });
    } catch (e) {
      await sock.sendMessage(jid, { text: "Failed to ban user(s). Make sure I have admin rights." });
    }
  },

  /**
   * Kick user (remove from group)
   */
  async kick(sock, msg) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!await isAdmin(sock, jid, sender)) {
      return sock.sendMessage(jid, { text: "❌ You must be an admin to use this command." });
    }

    const toKick = getMentionedUsers(msg);
    if (toKick.length === 0) {
      return sock.sendMessage(jid, { text: "Please mention user(s) to kick." });
    }

    try {
      await sock.groupRemove(jid, toKick);
      await sock.sendMessage(jid, { text: `✅ Kicked user(s): ${toKick.join(", ")}` });
    } catch {
      await sock.sendMessage(jid, { text: "Failed to kick user(s). Make sure I have admin rights." });
    }
  },

  /**
   * Mute group (toggle group setting to announcement only)
   */
  async mute(sock, msg) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!await isAdmin(sock, jid, sender)) {
      return sock.sendMessage(jid, { text: "❌ You must be an admin to mute the group." });
    }

    try {
      await sock.groupSettingUpdate(jid, "announcement");
      await sock.sendMessage(jid, { text: "🔇 Group muted. Only admins can send messages now." });
    } catch {
      await sock.sendMessage(jid, { text: "Failed to mute group." });
    }
  },

  /**
   * Warn user (send warning message)
   */
  async warn(sock, msg) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!await isAdmin(sock, jid, sender)) {
      return sock.sendMessage(jid, { text: "❌ You must be an admin to warn users." });
    }

    const toWarn = getMentionedUsers(msg);
    if (toWarn.length === 0) {
      return sock.sendMessage(jid, { text: "Please mention user(s) to warn." });
    }

    await sock.sendMessage(jid, { text: `⚠️ Warning sent to: ${toWarn.join(", ")}` });
  },

  /**
   * Promote user to admin
   */
  async promote(sock, msg) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!await isAdmin(sock, jid, sender)) {
      return sock.sendMessage(jid, { text: "❌ You must be an admin to promote users." });
    }

    const toPromote = getMentionedUsers(msg);
    if (toPromote.length === 0) {
      return sock.sendMessage(jid, { text: "Please mention user(s) to promote." });
    }

    try {
      await sock.groupParticipantsUpdate(jid, toPromote, "promote");
      await sock.sendMessage(jid, { text: `✅ Promoted user(s): ${toPromote.join(", ")}` });
    } catch {
      await sock.sendMessage(jid, { text: "Failed to promote user(s)." });
    }
  },

  /**
   * Demote user from admin
   */
  async demote(sock, msg) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!await isAdmin(sock, jid, sender)) {
      return sock.sendMessage(jid, { text: "❌ You must be an admin to demote users." });
    }

    const toDemote = getMentionedUsers(msg);
    if (toDemote.length === 0) {
      return sock.sendMessage(jid, { text: "Please mention user(s) to demote." });
    }

    try {
      await sock.groupParticipantsUpdate(jid, toDemote, "demote");
      await sock.sendMessage(jid, { text: `✅ Demoted user(s): ${toDemote.join(", ")}` });
    } catch {
      await sock.sendMessage(jid, { text: "Failed to demote user(s)." });
    }
  },

  /**
   * Add user to group by phone number or ID
   * Usage: .add 1234567890@s.whatsapp.net
   */
  async add(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!await isAdmin(sock, jid, sender)) {
      return sock.sendMessage(jid, { text: "❌ You must be an admin to add users." });
    }

    if (!args[0]) return sock.sendMessage(jid, { text: "Specify a number or user ID to add." });

    try {
      await sock.groupAdd(jid, [args[0]]);
      await sock.sendMessage(jid, { text: `✅ Added user: ${args[0]}` });
    } catch (e) {
      await sock.sendMessage(jid, { text: "Failed to add user. Make sure the number is correct and I have permission." });
    }
  },

  /**
   * Remove user from group
   * Usage: .remove @user
   */
  async remove(sock, msg) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!await isAdmin(sock, jid, sender)) {
      return sock.sendMessage(jid, { text: "❌ You must be an admin to remove users." });
    }

    const toRemove = getMentionedUsers(msg);
    if (toRemove.length === 0) {
      return sock.sendMessage(jid, { text: "Please mention user(s) to remove." });
    }

    try {
      await sock.groupRemove(jid, toRemove);
      await sock.sendMessage(jid, { text: `✅ Removed user(s): ${toRemove.join(", ")}` });
    } catch {
      await sock.sendMessage(jid, { text: "Failed to remove user(s)." });
    }
  },

  /**
   * Clear chat messages for all (admin only)
   */
  async clear(sock, msg) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!await isAdmin(sock, jid, sender)) {
      return sock.sendMessage(jid, { text: "❌ You must be an admin to clear chat." });
    }

    try {
      // WhatsApp API does not support bulk delete messages
      // As a workaround, delete the command message only
      await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: true, id: msg.key.id } });
      await sock.sendMessage(jid, { text: "🧹 Chat cleared (trigger message deleted)." });
    } catch {
      await sock.sendMessage(jid, { text: "Failed to clear chat." });
    }
  },

  /**
   * Get group or user info
   */
  async info(sock, msg) {
    const jid = msg.key.remoteJid;

    try {
      if (jid.endsWith("@g.us")) {
        const metadata = await sock.groupMetadata(jid);
        const desc = metadata.desc || "No description";
        const subject = metadata.subject || "No subject";
        const owner = metadata.owner || "Unknown";
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id).join(", ") || "None";
        const membersCount = metadata.participants.length;

        const infoMessage = 
          `*Group Info*\n` +
          `Subject: ${subject}\n` +
          `Description: ${desc}\n` +
          `Owner: ${owner}\n` +
          `Admins: ${admins}\n` +
          `Members: ${membersCount}`;

        await sock.sendMessage(jid, { text: infoMessage });
      } else {
        // For individual chats, send basic info
        await sock.sendMessage(jid, { text: `This is a private chat with: ${jid}` });
      }
    } catch {
      await sock.sendMessage(jid, { text: "Failed to retrieve info." });
    }
  }
};