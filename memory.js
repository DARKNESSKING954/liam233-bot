import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Make path relative to this file's actual location, not CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, 'data.json');

let userData = {};

// Load data from file on startup
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    userData = JSON.parse(raw);
    console.log('✅ User data loaded from file.');
  } catch (err) {
    console.error('❌ Failed to load user data:', err);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));
  } catch (err) {
    console.error('❌ Failed to save user data:', err);
  }
}

function ensureUser(userId) {
  if (!userData[userId]) {
    userData[userId] = {
      coins: 1000,
      lastDaily: 0,
      fifaCards: []
    };
    saveData();
  }
}

export function getUserData(userId) {
  ensureUser(userId);
  return userData[userId];
}

export function updateUserData(userId, newFields) {
  ensureUser(userId);
  userData[userId] = {
    ...userData[userId],
    ...newFields
  };
  saveData();
}

export function getWallet(userId) {
  ensureUser(userId);
  return userData[userId].coins;
}

export function addCoins(userId, amount) {
  ensureUser(userId);
  userData[userId].coins += amount;
  saveData();
}

export function removeCoins(userId, amount) {
  ensureUser(userId);
  if (userData[userId].coins >= amount) {
    userData[userId].coins -= amount;
    saveData();
    return true;
  }
  return false;
}

export function getFifaCards(userId) {
  ensureUser(userId);
  return userData[userId].fifaCards;
}

export function addFifaCard(userId, cardName) {
  ensureUser(userId);
  userData[userId].fifaCards.push(cardName);
  saveData();
}

export function exportData() {
  return JSON.stringify(userData, null, 2);
}

// ✅ Debug logs added for cooldown tracking
export function getLastDaily(userId) {
  ensureUser(userId);
  console.log(`[getLastDaily] userId=${userId} lastDaily=${userData[userId].lastDaily}`);
  return userData[userId].lastDaily || 0;
}

export function setLastDaily(userId, timestamp) {
  ensureUser(userId);
  console.log(`[setLastDaily] userId=${userId} timestamp=${timestamp}`);
  userData[userId].lastDaily = timestamp;  // Use consistent lastDaily number timestamp here
  saveData();
}