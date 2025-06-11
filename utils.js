// utils.js

/**
 * Extracts a consistent user ID from any incoming message.
 * Works for both group and private chats.
 */
export function getUserId(msg) {
  return msg.key.participant || msg.key.remoteJid;
}
