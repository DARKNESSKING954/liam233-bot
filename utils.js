// utils.js

/**
 * Check if the sender is an admin in the group chat.
 * @param {import('whatsapp-web.js').Client} sock - The WhatsApp client instance.
 * @param {import('whatsapp-web.js').Message} msg - The incoming message object.
 * @returns {Promise<boolean>} True if sender is admin, false otherwise.
 */
export async function isAdmin(sock, msg) {
  try {
    const chat = await sock.getChatById(msg.key.remoteJid);
    if (!chat.isGroup) return false;

    const admins = chat.participants.filter(p => p.isAdmin || p.isSuperAdmin);
    const senderId = msg.key.participant || msg.key.remoteJid;
    return admins.some(admin => admin.id._serialized === senderId);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}