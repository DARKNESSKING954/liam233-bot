// memory.js
import fs from 'fs';

const DATA_FILE = './data.json';
let userData = {};

// Load data from file on startup
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE);
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
      coins: 1000,
      fifaCards: [],
      lastDaily: 0
    };
    saveData();
  }
}

/**
 * Get user's coin balance
 */
export function getWallet(userId) {
  ensureUser(userId);
  return userData[userId].coins;
}

/**
 * Add coins to user's wallet
 */
export function addCoins(userId, amount) {
  ensureUser(userId);
  userData[userId].coins += amount;
  saveData();
}

/**
 * Remove coins from user's wallet
 */
export function removeCoins(userId, amount) {
  ensureUser(userId);
  if (userData[userId].coins >= amount) {
    userData[userId].coins -= amount;
    saveData();
    return true;
  }
  return false;
}

/**
 * Get user's last daily claim timestamp
 */
export function getLastDaily(userId) {
  ensureUser(userId);
  return userData[userId].lastDaily || 0;
}

/**
 * Set user's last daily claim timestamp
 */
export function setLastDaily(userId, timestamp) {
  ensureUser(userId);
  userData[userId].lastDaily = timestamp;
  saveData();
}

/**
 * Get user's FIFA cards
 */
export function getFifaCards(userId) {
  ensureUser(userId);
  return userData[userId].fifaCards;
}

/**
 * Add a FIFA card to user's collection
 */
export function addFifaCard(userId, cardName) {
  ensureUser(userId);
  userData[userId].fifaCards.push(cardName);
  saveData();
}

/**
 * Export all user data - for debugging or backups
 */
export function exportData() {
  return JSON.stringify(userData, null, 2);
}

/**
 * Get all user data (full object)
 */
export function getUserData(userId) {
  ensureUser(userId);
  return userData[userId];
}

/**
 * Update multiple fields in user data
 */
export function updateUserData(userId, updates) {
  ensureUser(userId);
  Object.assign(userData[userId], updates);
  saveData();
}