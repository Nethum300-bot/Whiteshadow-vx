const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/chatbotDB.json');

// ✅ Create DB file if not exists
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

// Load database
const loadDB = () => JSON.parse(fs.readFileSync(dbPath));
const saveDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

cmd({
  pattern: "chatbot",
  desc: "Turn chatbot AI on or off",
  react: "🤖",
  category: "AI"
}, async (m, { text }) => {
  let db = loadDB();
  const id = m.isGroup ? m.chat : m.sender;
  const mode = text.trim().toLowerCase();

  if (!["on", "off"].includes(mode))
    return await m.reply("⚙️ Usage: *.chatbot on* or *.chatbot off*");

  db[id] = mode === "on";
  saveDB(db);

  await m.reply(`✅ Chatbot *${mode.toUpperCase()}* successfully for this chat.`);
});

cmd({
  on: "message"
}, async (m, { quoted, isGroup }) => {
  try {
    // Ignore bot messages or commands
    if (!m.text || m.text.startsWith('.') || m.text.startsWith('!')) return;

    let db = loadDB();
    const id = isGroup ? m.chat : m.sender;

    // Check if chatbot enabled
    if (!db[id]) return;

    // Get AI response
    const query = encodeURIComponent(m.text);
    const apiUrl = `https://whiteshadow-thz2.onrender.com/ai/gpt-5-mini?query=${query}`;

    const { data } = await axios.get(apiUrl);
    if (data && data.answer) {
      await m.reply(`🤖 *WhiteShadow AI:*\n${data.answer}`);
    }
  } catch (err) {
    console.error("Chatbot Error:", err.message);
  }
});
