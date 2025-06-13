// utils.js

export function getUserId(msg) {
  if (msg.key.participant) return msg.key.participant;
  if (msg.key.remoteJid.endsWith('@g.us')) return msg.participant || msg.key.remoteJid;
  return msg.key.remoteJid;
}

/**
 * Check if a user is an admin or super admin in a group chat.
 * @param {object} sock - WhatsApp client instance
 * @param {string} chatId - Group chat ID
 * @param {string} userId - User ID to check (e.g. '12345@s.whatsapp.net')
 * @returns {Promise<boolean>} True if user is admin, else false
 */
export async function isAdmin(sock, chatId, userId) {
  try {
    const metadata = await sock.groupMetadata(chatId);
    const participants = metadata.participants;
    return participants.some(
      (p) => p.id._serialized === userId && (p.isAdmin || p.isSuperAdmin)
    );
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}