// commands/admin.js
// 📱 Admin commands for managing groups and users

import fs from 'fs';
import path from 'path';

/**
 * Helper: Check if user is group admin
 */
export async function isAdmin(sock, jid, userId) {
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
 */
export function getMentionedUsers(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

/**
 * Ban user
 */
export async function ban(sock, msg) {
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
    await sock.groupParticipantsUpdate(jid, toBan, "remove");
    await sock.sendMessage(jid, { text: `✅ Banned user(s): ${toBan.join(", ")}` });
  } catch (e) {
    await sock.sendMessage(jid, { text: "Failed to ban user(s). Make sure I have admin rights." });
  }
}

/**
 * Kick user
 */
export async function kick(sock, msg) {
  return ban(sock, msg); // Same logic as ban in this case
}

/**
 * Mute group
 */
export async function mute(sock, msg) {
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
}

/**
 * Warn user
 */
export async function warn(sock, msg) {
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
}

/**
 * Promote user
 */
export async function promote(sock, msg) {
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
}

/**
 * Demote user
 */
export async function demote(sock, msg) {
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
}

/**
 * Add user
 */
export async function add(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You must be an admin to add users." });
  }

  if (!args[0]) return sock.sendMessage(jid, { text: "Specify a number or user ID to add." });

  try {
    await sock.groupParticipantsUpdate(jid, [args[0]], "add");
    await sock.sendMessage(jid, { text: `✅ Added user: ${args[0]}` });
  } catch {
    await sock.sendMessage(jid, { text: "Failed to add user. Make sure the number is correct and I have permission." });
  }
}

/**
 * Remove user
 */
export async function remove(sock, msg) {
  return ban(sock, msg);
}

/**
 * Clear chat (admin-only)
 */
export async function clear(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You must be an admin to clear chat." });
  }

  try {
    await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: true, id: msg.key.id } });
    await sock.sendMessage(jid, { text: "🧹 Chat cleared." });
  } catch {
    await sock.sendMessage(jid, { text: "Failed to clear chat." });
  }
}

/**
 * Get group or user info
 */
export async function info(sock, msg) {
  const jid = msg.key.remoteJid;

  try {
    if (jid.endsWith("@g.us")) {
      const metadata = await sock.groupMetadata(jid);
      const desc = metadata.desc || "No description";
      const subject = metadata.subject || "No subject";
      const owner = metadata.owner || "Unknown";

      let text = `*Group Info*\nSubject: ${subject}\nOwner: ${owner}\nDescription: ${desc}\nMembers: ${metadata.participants.length}`;
      await sock.sendMessage(jid, { text });
    } else {
      await sock.sendMessage(jid, { text: "Info command works only in groups." });
    }
  } catch {
    await sock.sendMessage(jid, { text: "Failed to fetch info." });
  }
}

/**
 * Set group description
 */
export async function setdesc(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You must be an admin to set description." });
  }

  if (args.length === 0) return sock.sendMessage(jid, { text: "Specify the description text." });

  try {
    await sock.groupUpdateDescription(jid, args.join(" "));
    await sock.sendMessage(jid, { text: "✅ Group description updated." });
  } catch {
    await sock.sendMessage(jid, { text: "Failed to update description." });
  }
}

/**
 * Set group subject
 */
export async function setsubject(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You must be an admin to set subject." });
  }

  if (args.length === 0) return sock.sendMessage(jid, { text: "Specify the subject text." });

  try {
    await sock.groupUpdateSubject(jid, args.join(" "));
    await sock.sendMessage(jid, { text: "✅ Group subject updated." });
  } catch {
    await sock.sendMessage(jid, { text: "Failed to update subject." });
  }
}

/**
 * Leave the group
 */
export async function leave(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You must be an admin to make me leave." });
  }

  try {
    await sock.groupLeave(jid);
  } catch {
    await sock.sendMessage(jid, { text: "Failed to leave the group." });
  }
}
