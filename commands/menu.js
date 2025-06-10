module.exports = {
  name: "menu",
  description: "Displays the main menu",
  execute(sock, msg, args) {
    const menuMessage = `╭━━━❰ *🤖 LiamBot WhatsApp Menu* ❱━━━╮
┃ 👤 Owner: *Liam Arendsen*
┃ ☎️ Contact: https://wa.me/+27833098338
┃ 📺 YouTube: https://youtube.com/@iamslow?si=w09HUoRm6-OvUo1V
┃
┃ 🧩 *Need your own custom WhatsApp Bot?*
┃ 💼 If you're a *business owner* or *entrepreneur* selling products,
┃ 📲 message me to build your *personalized automatic WhatsApp bot*.
┃ ⚡ Automate sales, FAQs, support, and more.
┃ 🔥 DM now and take your business to the next level!
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🏅 *Leaderboard & Wallet*
• .leaderboard
• .wallet
• .daily

🧠 *Emotions*
• .kiss • .slap • .hug • .poke • .cuddle
• .pat • .bite • .dance • .cry • .laugh
• .wave • .smile • .angry • .blush • .highfive

🛠 *Admin Tools*
• .kick • .ban • .mute • .warn • .promote
• .demote • .add • .remove • .clear • .info
• .role • .setdesc • .setsubject • .seticon • .leave

🎰 *Casino Games*
• .slot • .coinflip • .dice • .roulette • .blackjack
• .poker • .bingo • .scratch • .lottery • .crash
• .wheel • .keno • .slots • .bet • .jackpot

🎉 *Fun*
• .8ball • .joke • .meme • .fact • .trivia
• .riddle • .quote • .fortune • .compliment • .insult
• .say • .echo • .flip • .roll • .random

🖼 *Media Tools*
• .sticker • .toimg • .gif • .ytmp3 • .ytmp4
• .tomp3 • .tomp4 • .compress • .resize • .crop
• .rotate • .reverse • .filter • .caption • .download

🎵 *Music*
• .play • .pause • .resume • .skip • .queue
• .stop • .nowplaying • .volume • .lyrics • .shuffle
• .repeat • .join • .leave • .search • .playlist

🛒 *FIFA Shop*
• .fifashop • .buy [name] • .mycards

🚫 *Anti-Spam*
• .antispam • .warn • .mute • .ban • .kick
• .slowmode • .filter • .blacklist • .whitelist • .report
• .cleanup • .block • .unblock • .audit • .log

Type *.help* or *.menu* to see this menu again.
Have fun using the bot! 🎉`;

    sock.sendMessage(msg.key.remoteJid, { text: menuMessage });
  }
};