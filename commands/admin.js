// commands/admin.js
// 🛡️ Group Admin Tools — Xeon Style

async function isAdmin(sock, jid, userId) {
  try {
    const metadata = await sock.groupMetadata(jid);
    const user = metadata.participants.find(p => p.id === userId);
    return user && (user.admin === 'admin' || user.admin === 'superadmin');
  } catch {
    return false;
  }
}

function getMentionedUsers(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

function getUserRole(metadata, id) {
  const user = metadata.participants.find(p => p.id === id);
  if (!user) return '❓ Not Found';
  if (user.admin === 'superadmin') return '👑 Group Owner';
  if (user.admin === 'admin') return '🛡️ Admin';
  return '👤 Member';
}

// .promote
export async function promote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentioned = getMentionedUsers(msg);
  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `😤 You're not even admin, chill.` });
  if (!mentioned.length)
    return sock.sendMessage(jid, { text: `🤔 Tag someone to promote!\nUsage: *.promote @user*` });

  for (let target of mentioned) {
    try {
      await sock.groupParticipantsUpdate(jid, [target], 'promote');
      await sock.sendMessage(jid, {
        text: `🆙 @${target.split('@')[0]} promoted to admin!`,
        mentions: [target]
      });
    } catch {
      await sock.sendMessage(jid, { text: `❌ Failed to promote @${target.split('@')[0]}` });
    }
  }
}

// .demote
export async function demote(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentioned = getMentionedUsers(msg);
  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🙃 You can’t demote anyone. Not admin.` });
  if (!mentioned.length)
    return sock.sendMessage(jid, { text: `📉 Tag someone to demote.\nUsage: *.demote @user*` });

  for (let target of mentioned) {
    try {
      await sock.groupParticipantsUpdate(jid, [target], 'demote');
      await sock.sendMessage(jid, {
        text: `😢 @${target.split('@')[0]} was demoted. Back to default.`,
        mentions: [target]
      });
    } catch {
      await sock.sendMessage(jid, { text: `❌ Couldn't demote @${target.split('@')[0]}` });
    }
  }
}

// .add
export async function add(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🚫 You're not allowed to add. Admins only.` });

  const number = args[0]?.replace(/[^0-9]/g, '');
  if (!number)
    return sock.sendMessage(jid, { text: `✳️ Provide a number to add.\nUsage: *.add 1234567890*` });

  try {
    const id = number + '@s.whatsapp.net';
    await sock.groupParticipantsUpdate(jid, [id], 'add');
    await sock.sendMessage(jid, {
      text: `👋 Welcome @${number}!`,
      mentions: [id]
    });
  } catch {
    await sock.sendMessage(jid, { text: `❌ Could not add user. Privacy issues maybe.` });
  }
}

// .remove
export async function remove(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentioned = getMentionedUsers(msg);
  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `❌ Only admins can kick.` });
  if (!mentioned.length)
    return sock.sendMessage(jid, { text: `🗑️ Tag someone to remove.\nUsage: *.remove @user*` });

  for (let target of mentioned) {
    try {
      await sock.groupParticipantsUpdate(jid, [target], 'remove');
      await sock.sendMessage(jid, {
        text: `👢 @${target.split('@')[0]} removed from the group.`,
        mentions: [target]
      });
    } catch {
      await sock.sendMessage(jid, { text: `❌ Couldn't remove @${target.split('@')[0]}` });
    }
  }
}

// .setdesc
export async function setdesc(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const text = args.join(' ');
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🚷 You can't set description.` });
  if (!text)
    return sock.sendMessage(jid, { text: `📝 Usage: *.setdesc New group description*` });

  try {
    await sock.groupUpdateDescription(jid, text);
    await sock.sendMessage(jid, { text: `✏️ Group description updated!` });
  } catch {
    await sock.sendMessage(jid, { text: `❌ Couldn't update group description.` });
  }
}

// .setsubject
export async function setsubject(sock, msg, args) {
  const jid = msg.key.remoteJid;
  const text = args.join(' ');
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `⚠️ You're not allowed to change the group name.` });
  if (!text)
    return sock.sendMessage(jid, { text: `📛 Usage: *.setsubject New Group Name*` });

  try {
    await sock.groupUpdateSubject(jid, text);
    await sock.sendMessage(jid, { text: `✅ Group name changed successfully.` });
  } catch {
    await sock.sendMessage(jid, { text: `❌ Couldn't change group name.` });
  }
}

// .mute
export async function mute(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🔕 Admins only can mute the group.` });

  try {
    await sock.groupSettingUpdate(jid, 'announcement');
    await sock.sendMessage(jid, { text: `🔇 Group muted. Only admins may speak.` });
  } catch {
    await sock.sendMessage(jid, { text: `❌ Couldn't mute group.` });
  }
}

// .unmute
export async function unmute(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🔊 Only admins can unmute the group.` });

  try {
    await sock.groupSettingUpdate(jid, 'not_announcement');
    await sock.sendMessage(jid, { text: `🔈 Group unmuted. Everyone can speak!` });
  } catch {
    await sock.sendMessage(jid, { text: `❌ Couldn't unmute group.` });
  }
}

// .role
export async function role(sock, msg) {
  const jid = msg.key.remoteJid;
  const mentioned = getMentionedUsers(msg);
  const metadata = await sock.groupMetadata(jid);
  if (!mentioned.length)
    return sock.sendMessage(jid, { text: `🔍 Tag someone to check their role.\nUsage: *.role @user*` });

  for (let id of mentioned) {
    const role = getUserRole(metadata, id);
    await sock.sendMessage(jid, {
      text: `🧾 @${id.split('@')[0]}'s Role: ${role}`,
      mentions: [id]
    });
  }
}

// .tagall
export async function tagall(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!(await isAdmin(sock, jid, sender)))
    return sock.sendMessage(jid, { text: `🫢 Only admins can tag everyone.` });

  try {
    const metadata = await sock.groupMetadata(jid);
    const members = metadata.participants.map(p => p.id);
    const mentions = members.map(m => m);
    const names = mentions.map(m => `➤ @${m.split('@')[0]}`).join('\n');

    await sock.sendMessage(jid, {
      text: `📢 *TAGGING ALL MEMBERS:*\n\n${names}`,
      mentions
    });
  } catch {
    await sock.sendMessage(jid, { text: `❌ Couldn't tag everyone.` });
  }
}