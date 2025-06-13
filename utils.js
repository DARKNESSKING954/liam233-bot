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
    const chatId = msg.key.remoteJid;
    const userId = msg.key.participant || msg.key.remoteJid;
    const metadata = await sock.groupMetadata(chatId);
    if (!metadata) return false;
    const participants = metadata.participants;
    return participants.some(
      (p) => p.id._serialized === userId && (p.isAdmin || p.isSuperAdmin)
    );
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}