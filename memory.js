import fs from 'fs';

const DATA_FILE = './data.json';
let userData = {};

// Load data from file on startup (if it exists)
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    userData = JSON.parse(raw);
    console.log('✅ User data loaded from file.');
  } catch (err) {
    console.error('❌ Failed to load user data:', err);
  }
}

/**
 * Save current user data to disk
 */
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));
  } catch (err) {
    console.error('❌ Failed to save user data:', err);
  }
}

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
    saveData();  // Save after creating new user
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
  saveData();  // Save after updating
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
    saveData();  // Save after updating
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
  saveData();  // Save after updating
}

/**
 * Export all user data - for debugging or backups
 */
export function exportData() {
  return JSON.stringify(userData, null, 2);
}