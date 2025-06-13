// utils.js

export function getUserId(msg) {
  if (msg.key.participant) return msg.key.participant;
  if (msg.key.remoteJid.endsWith('@g.us')) return msg.participant || msg.key.remoteJid;
  return msg.key.remoteJid;
}

/**
 * Check if the sender is an admin or super admin in a group chat.
 * @param {object} sock - WhatsApp client instance
 * @param {object} msg - WhatsApp message object
 * @returns {Promise<boolean>} True if sender is admin, else false
 */
export async function isAdmin(sock, msg) {
  try {
    const chat = await sock.getChatById(msg.key.remoteJid);
    if (!chat.isGroup) return false;
    const admins = chat.participants.filter(p => p.isAdmin || p.isSuperAdmin);
    const senderId = msg.key.participant || msg.key.remoteJid;
    return admins.some(admin => admin.id._serialized === senderId);
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}