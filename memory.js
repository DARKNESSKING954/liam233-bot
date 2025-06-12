import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, 'data.json');

let userData = {};

// Load existing user data
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
      lastDailyDate: null,
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

// ✅ Cooldown tracking (calendar date-based)
export function getLastDaily(userId) {
  ensureUser(userId);
  const date = userData[userId].lastDailyDate || null;
  console.log(`[getLastDaily] ${userId}: ${date}`);
  return date;
}

export function setLastDaily(userId, dateStr) {
  ensureUser(userId);
  console.log(`[setLastDaily] ${userId}: ${dateStr}`);
  userData[userId].lastDailyDate = dateStr;
  saveData();
}