// commands/admin.js
// 🤖 Group admin tools with personality and full functionality

import fs from 'fs';
import path from 'path';

/**
 * Check if a user is admin
 */
async function isAdmin(sock, jid, userId) {
  try {
    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants || [];
    const user = participants.find(p => p.id === userId);
    return user && (user.admin === 'admin' || user.admin === 'superadmin');
  } catch {
    return false;
  }
}

function getMentionedUsers(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

// 📤 Fun response templates
function randomText(type, target) {
  const lines = {
    kick: [
      `👢 Goodbye @${target.split('@')[0]}, don't forget your luggage!`,
      `😅 Oof! @${target.split('@')[0]} just got launched out the group.`,
      `🚪 Bye-bye @${target.split('@')[0]}, door’s that way.`
    ],
    ban: [
      `🧹 Cleaned up! @${target.split('@')[0]} has been banned.`,
      `🚫 Banned! @${target.split('@')[0]} was too spicy for this group.`,
      `🛑 Sayonara @${target.split('@')[0]}!`
    ],
    promote: [
      `🎉 Congrats @${target.split('@')[0]}! You're now admin.`,
      `👑 Bow down! @${target.split('@')[0]} has been promoted.`,
    ],
    demote: [
      `👎 Oof! @${target.split('@')[0]} just lost their admin cape.`,
      `📉 Demoted! Back to peasant status @${target.split('@')[0]}.`,
    ],
    mute: [`🔇 Group has been muted. Only admins can chat now.`],
    unmute: [`🔊 Group is now open. Everyone can chat!`],
    leave: [`👋 I'm out! Peace.`],
    warn: [`⚠️ Warning sent to @${target.split('@')[0]}. Be careful!`]
  };
  return lines[type][Math.floor(Math.random() * lines[type].length)];
}

/**
 * Kick/Ban user
 */
export async function kick(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentioned = getMentionedUsers(msg);

  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🚫 You’re not admin. Nice try, rookie.` });

  if (mentioned.length === 0)
    return sock.sendMessage(jid, { text: `👀 Tag someone to kick.` });

  for (let target of mentioned) {
    try {
      await sock.groupParticipantsUpdate(jid, [target], 'remove');
      await sock.sendMessage(jid, {
        text: randomText('kick', target),
        mentions: [target],
      });
    } catch {
      await sock.sendMessage(jid, { text: `❌ Failed to kick @${target.split('@')[0]}` });
    }
  }
}
export const ban = kick;

/**
 * Mute / Unmute group
 */
export async function mute(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🛑 You’re not admin, can’t mute.` });

  try {
    await sock.groupSettingUpdate(jid, 'announcement');
    await sock.sendMessage(jid, { text: randomText('mute') });
  } catch {
    await sock.sendMessage(jid, { text: '❌ Mute failed. Am I even admin here?' });
  }
}

export async function unmute(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🚷 Can’t unmute unless you’re admin.` });

  try {
    await sock.groupSettingUpdate(jid, 'not_announcement');
    await sock.sendMessage(jid, { text: randomText('unmute') });
  } catch {
    await sock.sendMessage(jid, { text: 'Unmute failed. Something went boom 💥' });
  }
}

/**
 * Promote/Demote user
 */
export async function promote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentioned = getMentionedUsers(msg);

  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `⚠️ You're not admin. No promote powers.` });

  if (mentioned.length === 0)
    return sock.sendMessage(jid, { text: `Tag someone to promote.` });

  for (let target of mentioned) {
    try {
      await sock.groupParticipantsUpdate(jid, [target], 'promote');
      await sock.sendMessage(jid, {
        text: randomText('promote', target),
        mentions: [target]
      });
    } catch {
      await sock.sendMessage(jid, { text: `❌ Failed to promote @${target.split('@')[0]}` });
    }
  }
}

export async function demote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentioned = getMentionedUsers(msg);

  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `😤 No admin badge, no demote power.` });

  if (mentioned.length === 0)
    return sock.sendMessage(jid, { text: `Tag someone to demote.` });

  for (let target of mentioned) {
    try {
      await sock.groupParticipantsUpdate(jid, [target], 'demote');
      await sock.sendMessage(jid, {
        text: randomText('demote', target),
        mentions: [target]
      });
    } catch {
      await sock.sendMessage(jid, { text: `❌ Failed to demote @${target.split('@')[0]}` });
    }
  }
}

/**
 * Add/Remove user
 */
export async function add(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🙅‍♂️ You can’t add. You're not admin.` });

  const number = args[0]?.replace(/[^0-9]/g, '');
  if (!number) return sock.sendMessage(jid, { text: `Provide a number to add.` });

  try {
    const id = number + '@s.whatsapp.net';
    await sock.groupParticipantsUpdate(jid, [id], 'add');
    await sock.sendMessage(jid, { text: `👤 Added: @${number}`, mentions: [id] });
  } catch {
    await sock.sendMessage(jid, { text: `❌ Couldn’t add @${number}` });
  }
}
export const remove = kick;

/**
 * Warn user
 */
export async function warn(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentioned = getMentionedUsers(msg);

  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🚷 No warning powers for you.` });

  if (mentioned.length === 0)
    return sock.sendMessage(jid, { text: `Tag someone to warn.` });

  for (let target of mentioned) {
    await sock.sendMessage(jid, {
      text: randomText('warn', target),
      mentions: [target]
    });
  }
}

/**
 * Clear bot's own message
 */
export async function clear(sock, msg) {
  try {
    await sock.sendMessage(msg.key.remoteJid, {
      delete: { remoteJid: msg.key.remoteJid, fromMe: true, id: msg.key.id }
    });
  } catch {
    await sock.sendMessage(msg.key.remoteJid, { text: `💥 Clear failed.` });
  }
}

/**
 * Group info
 */
export async function info(sock, msg) {
  const jid = msg.key.remoteJid;
  try {
    const metadata = await sock.groupMetadata(jid);
    const text = `👥 *Group Info*\n📛 Name: ${metadata.subject}\n👑 Owner: ${metadata.owner || 'Unknown'}\n📝 Desc: ${metadata.desc || 'No description'}\n👤 Members: ${metadata.participants.length}`;
    await sock.sendMessage(jid, { text });
  } catch {
    await sock.sendMessage(jid, { text: 'Failed to fetch group info 😓' });
  }
}

/**
 * Set group description
 */
export async function setdesc(sock, msg, args) {
  const jid = msg.key.remoteJid;
  if (!(await isAdmin(sock, jid, msg.key.participant || msg.key.remoteJid)))
    return sock.sendMessage(jid, { text: `You're not admin, genius.` });

  if (!args.length) return sock.sendMessage(jid, { text: 'Give me a description!' });

  try {
    await sock.groupUpdateDescription(jid, args.join(' '));
    await sock.sendMessage(jid, { text: '✏️ Description updated!' });
  } catch {
    await sock.sendMessage(jid, { text: `❌ Couldn't set description.` });
  }
}

/**
 * Set group subject
 */
export async function setsubject(sock, msg, args) {
  const jid = msg.key.remoteJid;
  if (!(await isAdmin(sock, jid, msg.key.participant || msg.key.remoteJid)))
    return sock.sendMessage(jid, { text: `Nice try, but you're not admin.` });

  if (!args.length) return sock.sendMessage(jid, { text: 'Type in a new subject!' });

  try {
    await sock.groupUpdateSubject(jid, args.join(' '));
    await sock.sendMessage(jid, { text: '📛 Group name changed!' });
  } catch {
    await sock.sendMessage(jid, { text: `❌ Couldn't set subject.` });
  }
}

/**
 * Set group icon (must reply to image)
 */
export async function seticon(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `You're not admin, chill.` });

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!quoted?.imageMessage)
    return sock.sendMessage(jid, { text: 'Reply to an image to set as group icon!' });

  try {
    const buffer = await sock.downloadMediaMessage({ message: quoted });
    await sock.groupUpdatePicture(jid, buffer);
    await sock.sendMessage(jid, { text: '🖼️ Group icon updated successfully!' });
  } catch (e) {
    await sock.sendMessage(jid, { text: `❌ Failed to update icon.` });
  }
}

/**
 * Leave group
 */
export async function leave(sock, msg) {
  const jid = msg.key.remoteJid;
  if (!(await isAdmin(sock, jid, msg.key.participant || msg.key.remoteJid)))
    return sock.sendMessage(jid, { text: `🤨 You want me to leave, but you're not even admin?` });

  await sock.sendMessage(jid, { text: randomText('leave') });
  await sock.groupLeave(jid);
}