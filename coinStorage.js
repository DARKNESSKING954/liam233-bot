// coinStorage.js
const coinMap = new Map();

function getWallet(userId) {
  return coinMap.get(userId) || 1000;
}

function addCoins(userId, amount) {
  const current = getWallet(userId);
  coinMap.set(userId, current + amount);
}

function removeCoins(userId, amount) {
  const current = getWallet(userId);
  if (current >= amount) {
    coinMap.set(userId, current - amount);
    return true;
  }
  return false;
}

export { getWallet, addCoins, removeCoins, coinMap };
