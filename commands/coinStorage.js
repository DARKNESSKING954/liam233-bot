// coinStorage.js

// ✅ This map holds all users' coin balances in memory
const coinMap = new Map();

// Get user's wallet (default to 0)
export function getWallet(user) {
  return coinMap.get(user) || 0;
}

// Add coins
export function addCoins(user, amount) {
  const current = getWallet(user);
  coinMap.set(user, current + amount);
}

// Remove coins safely (returns true if successful, false if not enough coins)
export function removeCoins(user, amount) {
  const current = getWallet(user);
  if (current < amount) return false;
  coinMap.set(user, current - amount);
  return true;
}