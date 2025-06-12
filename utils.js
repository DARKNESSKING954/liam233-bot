
export function getUserId(msg) {
  return msg.key.participant || msg.key.remoteJid;
}