// commands/admin.js
// ⚙️ LiamBot Admin Tools - Fun & Functional Group Management

import fs from 'fs';
import path from 'path';

// Helper to check admin status
export async function isAdmin(sock, jid, userId) {
  try {
    const metadata = await sock.groupMetadata(jid);
    const user = metadata.participants.find(p => p.id === userId);
    return user?.admin === 'admin' || user?.admin === 'superadmin';
  } catch {
    return false;
  }
}

export function getMentionedUsers(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

function formatMention(jid) {
  return `@${jid.split('@')[0]}`;
}

// 🦶 Kick / Ban
export async function kick(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const targets = getMentionedUsers(msg);

  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "🛑 Only admins can kick members." });
  }
  if (!targets.length) return sock.sendMessage(jid, { text: "👉 Mention someone to kick!" });

  await sock.groupParticipantsUpdate(jid, targets, "remove");
  await sock.sendMessage(jid, {
    text: `👢 Goodbye ${formatMention(targets[0])}, see you another time!`,
    mentions: targets
  });
}

// 🔇 Mute group
export async function mute(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!await isAdmin(sock, jid, sender))
    return sock.sendMessage(jid, { text: "❌ Only admins can mute the group." });

  await sock.groupSettingUpdate(jid, "announcement");
  await sock.sendMessage(jid, { text: "🔇 Group muted! Only admins can speak now." });
}

// ⚠️ Warn
export async function warn(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const targets = getMentionedUsers(msg);

  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "🚫 You can't warn unless you're an admin." });
  }
  if (!targets.length) return sock.sendMessage(jid, { text: "⚠️ Mention who to warn!" });

  await sock.sendMessage(jid, {
    text: `⚠️ Warning issued to ${formatMention(targets[0])}. Behave or face consequences!`,
    mentions: targets
  });
}

// 🔼 Promote
export async function promote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const targets = getMentionedUsers(msg);

  if (!await isAdmin(sock, jid, sender))
    return sock.sendMessage(jid, { text: "🔐 Only admins can promote others." });

  if (!targets.length) return sock.sendMessage(jid, { text: "⚠️ Mention who to promote!" });

  await sock.groupParticipantsUpdate(jid, targets, "promote");
  await sock.sendMessage(jid, {
    text: `🎉 ${formatMention(targets[0])} is now an admin! Welcome to the team!`,
    mentions: targets
  });
}

// 🔽 Demote
export async function demote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const targets = getMentionedUsers(msg);

  if (!await isAdmin(sock, jid, sender))
    return sock.sendMessage(jid, { text: "🔐 Only admins can demote others." });

  if (!targets.length) return sock.sendMessage(jid, { text: "Mention someone to demote." });

  await sock.groupParticipantsUpdate(jid, targets, "demote");
  await sock.sendMessage(jid, {
    text: `😔 ${formatMention(targets[0])} has been demoted from admin.`,
    mentions: targets
  });
}

// ➕ Add
export async function add(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!await isAdmin(sock, jid, sender))
    return sock.sendMessage(jid, { text: "❌ Only admins can add users." });

  const userToAdd = args[0]?.replace(/[^0-9]/g, '');
  if (!userToAdd) return sock.sendMessage(jid, { text: "Provide a valid number to add!" });

  try {
    await sock.groupParticipantsUpdate(jid, [`${userToAdd}@s.whatsapp.net`], "add");
    await sock.sendMessage(jid, { text: `✅ Added +${userToAdd} to the group.` });
  } catch {
    await sock.sendMessage(jid, { text: "Failed to add user. They might have privacy settings enabled." });
  }
}

// ➖ Remove (same as kick)
export async function remove(sock, msg) {
  return kick(sock, msg);
}

// 🧹 Clear message
export async function clear(sock, msg) {
  const jid = msg.key.remoteJid;
  if (!await isAdmin(sock, jid, msg.key.participant || msg.key.remoteJid))
    return sock.sendMessage(jid, { text: "❌ Only admins can clear messages." });

  await sock.sendMessage(jid, { delete: msg.key });
}

// ℹ️ Group Info
export async function info(sock, msg) {
  const jid = msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ Group info only works in groups." });

  try {
    const metadata = await sock.groupMetadata(jid);
    const text = `📌 *Group Info:*\n\n📛 Name: ${metadata.subject}\n👥 Members: ${metadata.participants.length}\n📝 Description: ${metadata.desc || "None"}\n👑 Owner: ${formatMention(metadata.owner || "N/A")}`;
    await sock.sendMessage(jid, { text, mentions: [metadata.owner] });
  } catch {
    await sock.sendMessage(jid, { text: "Failed to retrieve group info." });
  }
}

// 🎯 Role (same as info for now)
export async function role(sock, msg) {
  return info(sock, msg);
}

// 📝 Set Description
export async function setdesc(sock, msg, args) {
  const jid = msg.key.remoteJid;
  if (!await isAdmin(sock, jid, msg.key.participant || msg.key.remoteJid))
    return sock.sendMessage(jid, { text: "Only admins can change the group description." });

  const text = args.join(" ");
  if (!text) return sock.sendMessage(jid, { text: "Provide a new group description." });

  await sock.groupUpdateDescription(jid, text);
  await sock.sendMessage(jid, { text: "✅ Group description updated!" });
}

// 🏷️ Set Subject
export async function setsubject(sock, msg, args) {
  const jid = msg.key.remoteJid;
  if (!await isAdmin(sock, jid, msg.key.participant || msg.key.remoteJid))
    return sock.sendMessage(jid, { text: "Only admins can change the group subject." });

  const subject = args.join(" ");
  if (!subject) return sock.sendMessage(jid, { text: "Provide a new subject." });

  await sock.groupUpdateSubject(jid, subject);
  await sock.sendMessage(jid, { text: "✅ Group name updated!" });
}

// 🏃‍♂️ Leave Group
export async function leave(sock, msg) {
  const jid = msg.key.remoteJid;
  if (!await isAdmin(sock, jid, msg.key.participant || msg.key.remoteJid))
    return sock.sendMessage(jid, { text: "Only admins can make me leave." });

  await sock.sendMessage(jid, { text: "👋 Leaving the group. Bye!" });
  await sock.groupLeave(jid);
}