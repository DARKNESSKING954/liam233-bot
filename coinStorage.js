// coinStorage.js (root folder)

const coinMap = new Map();

export function getWallet(userId) {
  return coinMap.get(userId) || 0;
}

export function addCoins(userId, amount) {
  const current = coinMap.get(userId) || 0;
  coinMap.set(userId, current + amount);
}

export function removeCoins(userId, amount) {
  const current = coinMap.get(userId) || 0;
  coinMap.set(userId, Math.max(0, current - amount));
                              }
