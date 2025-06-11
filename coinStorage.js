// coinStorage.js

const coinMap = new Map();

export function getWallet(user) {
  return coinMap.get(user) || 0;
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
