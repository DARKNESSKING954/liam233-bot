// coinStorage.js

const coinMap = new Map();

// Always use the full JID like "user@s.whatsapp.net" — consistent with your bot
export function getWallet(user) {
  if (!coinMap.has(user)) {
    coinMap.set(user, 1000); // Default starting coins
  }
  return coinMap.get(user);
}

export function addCoins(user, amount) {
  const current = getWallet(user);
  coinMap.set(user, current + amount);
}

export function removeCoins(user, amount) {
  const current = getWallet(user);
  if (current < amount) return false;
  coinMap.set(user, current - amount);
  return true;
              }
