/**
                                    ⣀⡠⢤⡀          
                                 ⢀⡴⠟⠃  ⠙⣄         
                                ⣠⠋      ⠘⣆        
                              ⢠⠾⢛⠒       ⢸⡆       
                              ⣿⣶⣄⡈⠓⢄⠠⡀   ⣄⣷       
                             ⢀⣿⣷ ⠈⠱⡄⠑⣌⠆  ⡜⢻       
                             ⢸⣿⡿⠳⡆⠐⢿⣆⠈⢿  ⡇⠘⡆      
                              ⢿⣿⣷⡇  ⠈⢆⠈⠆⢸  ⢣      
                              ⠘⣿⣿⣿⣧  ⠈⢂ ⡇  ⢨⠓⣄    
                               ⣸⣿⣿⣿⣦⣤⠖⡏⡸ ⣀⡴⠋ ⠈⠢⡀  
                             ⢠⣾⠁⣹⣿⣿⣿⣷⣾⠽⠖⠊⢹⣀⠄   ⠈⢣⡀
                             ⡟⣇⣰⢫⢻⢉⠉ ⣿⡆  ⡸⡏      ⢇
                            ⢨⡇⡇⠈⢸⢸⢸  ⡇⡇  ⠁⠻⡄⡠⠂   ⠘
⢤⣄                         ⢠⠛⠓⡇ ⠸⡆⢸ ⢠⣿    ⣰⣿⣵⡆    
⠈⢻⣷⣦⣀                     ⣠⡿⣦⣀⡇ ⢧⡇  ⢺⡟   ⢰⠉⣰⠟⠊⣠⠂ ⡸
  ⢻⣿⣿⣷⣦⣀                 ⣠⢧⡙⠺⠿⡇ ⠘⠇  ⢸⣧  ⢠⠃⣾⣌⠉⠩⠭⠍⣉⡇
   ⠻⣿⣿⣿⣿⣿⣦⣀            ⣠⣞⣋ ⠈ ⡳⣧     ⢸⡏  ⡞⢰⠉⠉⠉⠉⠉⠓⢻⠃
    ⠹⣿⣿⣿⣿⣿⣿⣷⡄  ⢀⣀⠠⠤⣤⣤⠤⠞⠓⢠⠈⡆ ⢣⣸⣾⠆     ⢀⣀⡼⠁⡿⠈⣉⣉⣒⡒⠢⡼ 
     ⠘⣿⣿⣿⣿⣿⣿⣿⣎⣽⣶⣤⡶⢋⣤⠃⣠⡦⢀⡼⢦⣾⡤⠚⣟⣁⣀⣀⣀⣀ ⣀⣈⣀⣠⣾⣅ ⠑⠂⠤⠌⣩⡇ 
      ⠘⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡁⣺⢁⣞⣉⡴⠟⡀   ⠁⠸⡅ ⠈⢷⠈⠏⠙ ⢹⡛ ⢉   ⣀⣀⣼⡇ 
        ⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⡟⢡⠖⣡⡴⠂⣀⣀⣀⣰⣁⣀⣀⣸    ⠈⠁  ⠈ ⣠⠜⠋⣠⠁ 
           ⠙⢿⣿⣿⣿⡟⢿⣿⣿⣷⡟⢋⣥⣖⣉ ⠈⢁⡀⠤⠚⠿⣷⡦⢀⣠⣀⠢⣄⣀⡠⠔⠋⠁ ⣼⠃  
             ⠈⠻⣿⣿⡄⠈⠻⣿⣿⢿⣛⣩⠤⠒⠉⠁     ⠉⠒⢤⡀⠉⠁     ⢀⡿   
               ⠈⠙⢿⣤⣤⠴⠟⠋⠉             ⠈⠑⠤     ⢩⠇   
                  ⠈                               


**/
const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Track pending replies per chat
const pendingQuality = new Map();

cmd({
  pattern: "xvideo",
  alias: ["xv", "xvideos"],
  react: "🔞",
  desc: "Search Xvideos & download (choose quality reply)",
  category: "fun",
  use: ".xvideo <search term>",
  filename: __filename
}, async (conn, mek, m, { text }) => {
  try {
    if (!text) return m.reply("🔍 Please enter a search term!");

    // 🔎 Search API
    const search = await axios.get(`https://api.nekolabs.my.id/discovery/xvideos/search?q=${encodeURIComponent(text)}`);
    if (!search.data.success || !search.data.result?.length) return m.reply("⚠️ No results found!");

    const video = search.data.result[0];
    const { title, artist, duration, cover, url } = video;

    // 🧩 Downloader API
    const dl = await axios.get(`https://api.nekolabs.my.id/downloader/xvideos?url=${encodeURIComponent(url)}`);
    if (!dl.data.success) return m.reply("⚠️ Error fetching video!");

    const vids = dl.data.result.videos;
    const availableKeys = Object.keys(vids); // low, high, HLS
    if (availableKeys.length === 0) return m.reply("⚠️ No downloadable video found!");

    // Send thumbnail + options
    let menu = `🎬 *${title}*\n⏱ Duration: ${duration}\n\nReply with number to choose quality:\n`;
    availableKeys.forEach((k, i) => {
      let label = k === 'low' ? '360p (Low)' : k === 'high' ? '720p/1080p (High)' : 'HLS (Stream)';
      menu += `${i + 1}️⃣ ${label}\n`;
    });

    const msg = await conn.sendMessage(m.chat, { image: { url: cover }, caption: menu }, { quoted: mek });

    // Store pending
    pendingQuality.set(m.chat, {
      vids,
      keys: availableKeys,
      msgId: msg.key.id,
      title
    });

    // Auto delete after 30s
    setTimeout(() => pendingQuality.delete(m.chat), 30000);

  } catch (e) {
    console.log(e);
    m.reply("⚠️ Something went wrong! 😢");
  }
});

// ===================
// Global reply listener
// ===================
conn.ev.on("messages.upsert", async (update) => {
  try {
    const msg = update?.messages?.[0];
    if (!msg?.message) return;

    const text = msg.message.conversation?.trim();
    const chatId = msg.key.remoteJid;

    if (!pendingQuality.has(chatId)) return;
    const pending = pendingQuality.get(chatId);

    // Check reply is to the correct message
    const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === pending.msgId;
    if (!isReply) return;

    const index = parseInt(text) - 1;
    if (isNaN(index) || index < 0 || index >= pending.keys.length) {
      return conn.sendMessage(chatId, { text: "❌ Invalid number. Reply 1/2/3." }, { quoted: msg });
    }

    const key = pending.keys[index];
    let url = pending.vids[key];
    pendingQuality.delete(chatId);

    if (key.toLowerCase() === 'hls' || url.endsWith('.m3u8')) {
      // HLS sent as link
      return conn.sendMessage(chatId, { text: `🔗 Stream link (${key}):\n${url}` }, { quoted: msg });
    }

    // Download video
    const tmpFile = path.join(__dirname, `temp_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(tmpFile);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Send video
    await conn.sendMessage(chatId, {
      video: { url: tmpFile },
      caption: `✅ Download ready (${key})\n*${pending.title}*`
    }, { quoted: msg });

    fs.unlinkSync(tmpFile);

  } catch (e) {
    console.log("Reply handler error", e);
  }
});
