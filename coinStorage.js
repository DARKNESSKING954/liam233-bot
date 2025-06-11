// coinStorage.js
const coinMap = new Map();

function getWallet(user) {
  return coinMap.get(userId) || 1000;
}

function addCoins(user, amount) {
  const current = getWallet(userId);
  coinMap.set(userId, current + amount);
}

function removeCoins(user, amount) {
  const current = getWallet(userId);
  if (current >= amount) {
    coinMap.set(userId, current - amount);
    return true;
  }
  return false;
}

export { getWallet, addCoins, removeCoins, coinMap };
