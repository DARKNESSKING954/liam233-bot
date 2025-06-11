// commands/admin.js
// 🎮 LiamBot Admin Tools - Fully Functional & Fun Commands

import fs from 'fs';
import path from 'path';

/**
 * ✅ Helper: Check if user is admin
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
 * 🔗 Extract mentioned users
 */
export function getMentionedUsers(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

/**
 * 🦵 Kick / Ban / Remove
 */
export async function kick(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const toKick = getMentionedUsers(msg);

  if (!await isAdmin(sock, jid, sender)) {
    return sock.sendMessage(jid, { text: "😒 You're not an admin, back to peasant mode." });
  }

  if (toKick.length === 0) return sock.sendMessage(jid, { text: "👀 Mention someone to boot from the kingdom!" });

  try {
    await sock.groupParticipantsUpdate(jid, toKick, "remove");
    await sock.sendMessage(jid, {
      text: `🚪 ${toKick.map(u => `@${u.split('@')[0]}`).join(', ')} got yeeted!`,
      mentions: toKick
    });
  } catch {
    await sock.sendMessage(jid, { text: "🤖 I can't kick! Make me admin first, boss." });
  }
}
export const ban = kick;
export const remove = kick;

/**
 * 🔇 Mute
 */
export async function mute(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!await isAdmin(sock, jid, sender))
    return sock.sendMessage(jid, { text: "🔇 You can't mute, you're not the boss 😏" });

  try {
    await sock.groupSettingUpdate(jid, "announcement");
    await sock.sendMessage(jid, { text: "📵 Group is now mute! Only admins can speak. 😎" });
  } catch {
    await sock.sendMessage(jid, { text: "🤷‍♂️ Couldn’t mute the group. Do I look like admin to you?" });
  }
}

/**
 * ⚠️ Warn
 */
export async function warn(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const toWarn = getMentionedUsers(msg);

  if (!await isAdmin(sock, jid, sender))
    return sock.sendMessage(jid, { text: "🚨 Warning not allowed! You're not an admin, rookie." });

  if (toWarn.length === 0) return sock.sendMessage(jid, { text: "⚠️ Mention someone to give them a verbal slap!" });

  await sock.sendMessage(jid, {
    text: `⚠️ Warning to ${toWarn.map(u => `@${u.split('@')[0]}`).join(', ')}. Behave before I bring the ban hammer!`,
    mentions: toWarn
  });
}

/**
 * ⬆️ Promote
 */
export async function promote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const toPromote = getMentionedUsers(msg);

  if (!await isAdmin(sock, jid, sender))
    return sock.sendMessage(jid, { text: "🤓 You can’t promote! Go become admin first!" });

  if (toPromote.length === 0) return sock.sendMessage(jid, { text: "👆 Mention someone to give them power!" });

  try {
    await sock.groupParticipantsUpdate(jid, toPromote, "promote");
    await sock.sendMessage(jid, {
      text: `🧙‍♂️ Promoted ${toPromote.map(u => `@${u.split('@')[0]}`).join(', ')} to admin. Don’t mess it up!`,
      mentions: toPromote
    });
  } catch {
    await sock.sendMessage(jid, { text: "🧯 Failed to promote! I need admin powers too 😤" });
  }
}

/**
 * ⬇️ Demote
 */
export async function demote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const toDemote = getMentionedUsers(msg);

  if (!await isAdmin(sock, jid, sender))
    return sock.sendMessage(jid, { text: "💢 You're not admin. You can't dethrone anyone!" });

  if (toDemote.length === 0) return sock.sendMessage(jid, { text: "👆 Mention someone to snatch their crown!" });

  try {
    await sock.groupParticipantsUpdate(jid, toDemote, "demote");
    await sock.sendMessage(jid, {
      text: `👑 ${toDemote.map(u => `@${u.split('@')[0]}`).join(', ')} has been demoted. Powerless again!`,
      mentions: toDemote
    });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Failed to demote. I might not be admin!" });
  }
}

/**
 * ➕ Add
 */
export async function add(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) return sock.sendMessage(jid, { text: "👀 You can’t invite! You're not the party planner!" });

  const number = args[0]?.replace(/\D/g, '');
  if (!number) return sock.sendMessage(jid, { text: "📞 Provide a phone number to invite." });

  const userJid = number + "@s.whatsapp.net";
  try {
    await sock.groupParticipantsUpdate(jid, [userJid], "add");
    await sock.sendMessage(jid, { text: `🎉 Welcome @${number}!`, mentions: [userJid] });
  } catch {
    await sock.sendMessage(jid, { text: "🚫 Failed to add! User might not allow invites." });
  }
}

/**
 * 🧹 Clear
 */
export async function clear(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) return sock.sendMessage(jid, { text: "🧼 Only janitor-admins can clean up!" });

  try {
    await sock.sendMessage(jid, { delete: msg.key });
    await sock.sendMessage(jid, { text: "🧼 Message wiped out like it never existed!" });
  } catch {
    await sock.sendMessage(jid, { text: "😅 Couldn't clear it. Wrong format or no permission." });
  }
}

/**
 * 🧠 Info
 */
export async function info(sock, msg) {
  const jid = msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "ℹ️ This works in groups only!" });

  try {
    const metadata = await sock.groupMetadata(jid);
    const text = `📛 *Group Info*\n\n🔹 Name: ${metadata.subject}\n👑 Owner: ${metadata.owner?.split('@')[0]}\n📝 Desc: ${metadata.desc || "No description"}\n👥 Members: ${metadata.participants.length}`;
    await sock.sendMessage(jid, { text });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Couldn’t fetch group info!" });
  }
}

/**
 * 🏷 .setsubject
 */
export async function setsubject(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const subject = args.join(" ");
  if (!await isAdmin(sock, jid, sender)) return sock.sendMessage(jid, { text: "👮 You can't rename this group, nice try!" });

  if (!subject) return sock.sendMessage(jid, { text: "📛 Provide a subject!" });

  try {
    await sock.groupUpdateSubject(jid, subject);
    await sock.sendMessage(jid, { text: `✅ Group subject changed to *${subject}*.` });
  } catch {
    await sock.sendMessage(jid, { text: "😵 Failed to change subject!" });
  }
}

/**
 * 📝 .setdesc
 */
export async function setdesc(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const desc = args.join(" ");
  if (!await isAdmin(sock, jid, sender)) return sock.sendMessage(jid, { text: "✏️ You’re not admin, no editing rights for you!" });

  if (!desc) return sock.sendMessage(jid, { text: "📝 Provide a description!" });

  try {
    await sock.groupUpdateDescription(jid, desc);
    await sock.sendMessage(jid, { text: `📝 Description updated!` });
  } catch {
    await sock.sendMessage(jid, { text: "🚫 Failed to update description!" });
  }
}

/**
 * 🖼 .seticon
 */
export async function seticon(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!await isAdmin(sock, jid, sender)) return sock.sendMessage(jid, { text: "🖼 Nope. Only admins can change the group face!" });

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!quoted) return sock.sendMessage(jid, { text: "📸 Reply to an image to set it as group icon." });

  try {
    const stream = await sock.downloadMediaMessage({ key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quoted });
    await sock.updateProfilePicture(jid, stream);
    await sock.sendMessage(jid, { text: "🖼️ Group icon updated! Lookin' good 😎" });
  } catch {
    await sock.sendMessage(jid, { text: "😬 Failed to set group icon. Maybe wrong image format?" });
  }
}

/**
 * 🧑‍🤝‍🧑 .role
 */
export async function role(sock, msg) {
  const jid = msg.key.remoteJid;

  try {
    const metadata = await sock.groupMetadata(jid);
    const admins = metadata.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`);
    const members = metadata.participants.filter(p => !p.admin).map(p => `@${p.id.split('@')[0]}`);

    await sock.sendMessage(jid, {
      text: `👑 *Admins:*\n${admins.join('\n')}\n\n👥 *Members:*\n${members.slice(0, 10).join('\n')}...`,
      mentions: metadata.participants.map(p => p.id)
    });
  } catch {
    await sock.sendMessage(jid, { text: "❌ Couldn't fetch group roles!" });
  }
}

/**
 * 🚪 .leave
 */
export async function leave(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!await isAdmin(sock, jid, sender)) return sock.sendMessage(jid, { text: "😎 Only admins can kick me out!" });

  try {
    await sock.sendMessage(jid, { text: "👋 I'm out! Miss me already?" });
    await sock.groupLeave(jid);
  } catch {
    await sock.sendMessage(jid, { text: "😕 Couldn't leave. I'm trapped!" });
  }
}