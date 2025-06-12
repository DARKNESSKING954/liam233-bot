// utils.js
export function getUserId(msg) {
  if (msg.key.participant) return msg.key.participant;
  if (msg.key.remoteJid.endsWith('@g.us')) return msg.participant || msg.key.remoteJid;
  return msg.key.remoteJid;
}