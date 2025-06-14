// commands/menu.js

export default async function menu(sock, msg, args) {
  const chatId = msg.key.remoteJid;

  const menuText = `
╭━━━❰ *🤖 LiamBot WhatsApp Menu* ❱━━━╮
┃ 👤 Owner: *Liam Arendsen*
┃ ☎️ Contact: https://wa.me/27833098338
┃ 📺 YouTube: https://youtube.com/@iamslow?si=w09HUoRm6-OvUo1V
┃
┃ 🧩 *Need your own custom WhatsApp Bot?*
┃ 💼 If you're a *business owner* or *entrepreneur* selling products,
┃ 📲 message me to build your *personalized automatic WhatsApp bot*.
┃ ⚡ Automate sales, FAQs, support, and more.
┃ 🔥 DM now and take your business to the next level!
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

📊 *Top Commands* — Manage your coins and status:

• .leaderboard  — See top 5 richest players on the bot

• .wallet       — Check your coin balance and assets

• .daily        — Claim your daily coin reward (once per day)

• .give <@user> amount — Transfer coins to another user

🧠 *Emotions*
• .kiss
• .slap
• .hug
• .poke
• .cuddle
• .pat
• .bite
• .dance
• .cry
• .laugh
• .wave
• .smile
• .angry
• .blush
• .highfive

🛠 *Admin Tools*
• .promote
• .demote
• .add
• .remove
• .setdesc
• .setsubject
• .mute
• .unmute
• .role

🎰 *Casino Games*
• .horse

🎉 *Fun*
• .tts
• .joke
• .fact
• .trivia
• .riddle
• .quote
• .fortune
• .compliment
• .insult
• .say
• .echo
• .flip
• .roll
• .random

🖼 *Media Tools*
• .sticker
• .play
• .youtube
• .meme

🚫 *Anti-Spam*
• .antispam
• .antilink
• .antisticker
• .antiswearing
• .antiimage
• .antivideo
• .addbadword
• .removebadword

Type *.help* or *.menu* to see this menu again.
Have fun using LiamBot! 🎉
`;

  await sock.sendMessage(chatId, { text: menuText });
}