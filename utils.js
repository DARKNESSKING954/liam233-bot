// utils.js

// 🧑‍💻 Get user ID from a message
export function getUserId(msg) {
  if (msg.key.participant) return msg.key.participant;
  if (msg.key.remoteJid.endsWith('@g.us')) return msg.participant || msg.key.remoteJid;
  return msg.key.remoteJid;
}

// 🛡️ Check if sender is an admin in a group
export async function isAdmin(sock, msg) {
  try {
    const chatId = msg.key.remoteJid;
    const userId = msg.key.participant || msg.key.remoteJid;
    const metadata = await sock.groupMetadata(chatId);
    const participants = metadata?.participants || [];

    return participants.some(p =>
      (p.id === userId || p.id._serialized === userId) &&
      (p.admin === 'admin' || p.admin === 'superadmin')
    );
  } catch (error) {
    console.error('❌ Failed to check admin status:', error);
    return false;
  }
}

// 🧾 Optional: Sticker metadata utility (for wa-sticker-formatter use)
export function stickerMetadata(packname = 'LiamBot', author = 'StickerMaster') {
  return {
    pack: packname,
    author: author,
    type: 'full',
    categories: ['😂', '🔥', '💯'],
    id: `liambot-${Date.now()}`,
    quality: 75,
  };
}