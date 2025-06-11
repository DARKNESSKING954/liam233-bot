// memory.js
// In-memory storage for user data: coins and FIFA cards.
// You can later replace this with a database.

const userData = {};

/**
 * Ensures user data exists
 * @param {string} userId 
 */
function ensureUser(userId) {
  if (!userData[userId]) {
    userData[userId] = {
      coins: 1000, // Starting coins
      fifaCards: []
    };
  }
}

/**
 * Get user's coin balance
 * @param {string} userId 
 * @returns {number}
 */
export function getWallet(userId) {
  ensureUser(userId);
  return userData[userId].coins;
}

/**
 * Add coins to user's wallet
 * @param {string} userId 
 * @param {number} amount 
 */
export function addCoins(userId, amount) {
  ensureUser(userId);
  userData[userId].coins += amount;
}

/**
 * Remove coins from user's wallet
 * @param {string} userId 
 * @param {number} amount 
 * @returns {boolean} success
 */
export function removeCoins(userId, amount) {
  ensureUser(userId);
  if (userData[userId].coins >= amount) {
    userData[userId].coins -= amount;
    return true;
  }
  return false;
}

/**
 * Get user's FIFA cards
 * @param {string} userId 
 * @returns {string[]}
 */
export function getFifaCards(userId) {
  ensureUser(userId);
  return userData[userId].fifaCards;
}

/**
 * Add a FIFA card to user's collection
 * @param {string} userId 
 * @param {string} cardName 
 */
export function addFifaCard(userId, cardName) {
  ensureUser(userId);
  userData[userId].fifaCards.push(cardName);
}

/**
 * Export all user data - for persistence (not implemented here)
 */
export function exportData() {
  return JSON.stringify(userData, null, 2);
}