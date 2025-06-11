import fs from 'fs';
import path from 'path';

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

export function getMentionedUsers(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

export async function ban(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You must be an admin to ban users." });
  }

  const targets = getMentionedUsers(msg);
  if (targets.length === 0) {
    return sock.sendMessage(jid, { text: "Please mention user(s) to ban." });
  }

  try {
    await sock.groupParticipantsUpdate(jid, targets, "remove");
    await sock.sendMessage(jid, {
      text: `👢 *Goodbye!* ${targets.map(u => `@${u.split("@")[0]}`).join(" ")} has been *banned*!`,
      mentions: targets
    });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Failed to ban. Make sure I’m an admin too." });
  }
}

export async function kick(sock, msg) {
  return ban(sock, msg); // Shares logic with ban
}

export async function mute(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You must be an admin to mute the group." });
  }

  try {
    await sock.groupSettingUpdate(jid, "announcement");
    await sock.sendMessage(jid, { text: "🔇 Group has been muted! Only admins can talk now." });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Failed to mute group." });
  }
}

export async function warn(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ Only admins can issue warnings." });
  }

  const targets = getMentionedUsers(msg);
  if (!targets.length) {
    return sock.sendMessage(jid, { text: "Mention someone to warn." });
  }

  await sock.sendMessage(jid, {
    text: `⚠️ Warning issued to: ${targets.map(u => `@${u.split("@")[0]}`).join(" ")}\nBehave or face the consequences!`,
    mentions: targets
  });
}

export async function promote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You must be an admin to promote users." });
  }

  const targets = getMentionedUsers(msg);
  if (!targets.length) return sock.sendMessage(jid, { text: "Mention someone to promote." });

  try {
    await sock.groupParticipantsUpdate(jid, targets, "promote");
    await sock.sendMessage(jid, {
      text: `🎉 Congrats ${targets.map(u => `@${u.split("@")[0]}`).join(" ")}! You've been promoted to *Admin*!`,
      mentions: targets
    });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Promotion failed." });
  }
}

export async function demote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You must be an admin to demote users." });
  }

  const targets = getMentionedUsers(msg);
  if (!targets.length) return sock.sendMessage(jid, { text: "Mention someone to demote." });

  try {
    await sock.groupParticipantsUpdate(jid, targets, "demote");
    await sock.sendMessage(jid, {
      text: `😐 ${targets.map(u => `@${u.split("@")[0]}`).join(" ")} has been demoted. Power revoked!`,
      mentions: targets
    });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Demotion failed." });
  }
}

export async function add(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ Only admins can add members." });
  }

  if (!args[0]) return sock.sendMessage(jid, { text: "Provide a number to add." });

  try {
    const user = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    await sock.groupParticipantsUpdate(jid, [user], "add");
    await sock.sendMessage(jid, { text: `📩 Added: @${user.split("@")[0]}`, mentions: [user] });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Couldn't add the user. Check the number or group settings." });
  }
}

export async function remove(sock, msg) {
  return ban(sock, msg); // Same as kick/ban
}

export async function clear(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ Only admins can clear chat." });
  }

  try {
    await sock.sendMessage(jid, {
      delete: { remoteJid: jid, fromMe: true, id: msg.key.id }
    });
    await sock.sendMessage(jid, { text: "🧹 Message deleted." });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Failed to delete message." });
  }
}

export async function info(sock, msg) {
  const jid = msg.key.remoteJid;
  try {
    const metadata = await sock.groupMetadata(jid);
    let text = `📊 *Group Info*\n` +
               `Name: ${metadata.subject}\n` +
               `Owner: @${metadata.owner?.split("@")[0] || "Unknown"}\n` +
               `Description: ${metadata.desc || "No description"}\n` +
               `Members: ${metadata.participants.length}`;
    await sock.sendMessage(jid, { text, mentions: [metadata.owner] });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Couldn't fetch group info." });
  }
}

export async function setdesc(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You need admin rights to change description." });
  }

  const desc = args.join(" ");
  if (!desc) return sock.sendMessage(jid, { text: "Provide the description text." });

  try {
    await sock.groupUpdateDescription(jid, desc);
    await sock.sendMessage(jid, { text: "📝 Description updated." });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Failed to update description." });
  }
}

export async function setsubject(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You need admin rights to change subject." });
  }

  const subject = args.join(" ");
  if (!subject) return sock.sendMessage(jid, { text: "Provide a new group subject." });

  try {
    await sock.groupUpdateSubject(jid, subject);
    await sock.sendMessage(jid, { text: "🏷️ Group name changed." });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Failed to update subject." });
  }
}

export async function leave(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "❌ You must be an admin to make me leave." });
  }

  try {
    await sock.sendMessage(jid, { text: "👋 Goodbye everyone! I'm leaving the group." });
    await sock.groupLeave(jid);
  } catch {
    await sock.sendMessage(jid, { text: "❌ Failed to leave group." });
  }
}