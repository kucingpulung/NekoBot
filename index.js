import TelegramBot from 'node-telegram-bot-api';
import NekoBocc from 'nekobocc';
import express from 'express';

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });
const nekobocc = new NekoBocc();

// Dummy server untuk Koyeb & Uptimerobot
const app = express();
app.get('/', (req, res) => res.send('NekoBot is alive!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const formatGenres = (genres) => {
  return genres && genres.length
    ? genres.map((g) => `#${g.replace(/\s+/g, '')}`).join(' ')
    : '';
};

const formatDetailedMetadata = (data) => {
  const fields = [
    data.status && `Status: ${data.status}`,
    data.episode && `Episode: ${data.episode}`,
    data.aired && `Tayang: ${data.aired}`,
    data.duration && `Durasi: ${data.duration}`,
    data.score && `Score: ${data.score}`,
    data.views && `Views: ${data.views}`,
    data.producer && data.producer.length ? `Produser: ${data.producer.join(', ')}` : '',
    data.genre && data.genre.length ? `Genre: ${formatGenres(data.genre)}` : '',
  ].filter(Boolean).join('\n');

  const sizeInfo = data.size
    ? Object.entries(data.size).map(([res, size]) => `${res}: ${size}`).join('\n')
    : '';

  const urls = Array.isArray(data.url)
    ? data.url.map((u, i) => `Episode ${i + 1}: ${u}`).join('\n')
    : (data.url || '');

  return `${data.title}\n\n${fields}\n\nSinopsis:\n${data.synopsis}\n\nUkuran File:\n${sizeInfo}\n\nLink Episode:\n${urls}`;
};

const sendWithPhotoOrText = (chatId, imgUrl, caption) => {
  if (imgUrl) {
    bot.sendPhoto(chatId, imgUrl, {
      caption,
    }).catch(err => {
      console.error('Gagal kirim foto:', err);
      bot.sendMessage(chatId, caption);
    });
  } else {
    bot.sendMessage(chatId, caption);
  }
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcome = `Halo ${msg.from.first_name}! Aku NekoBot.

Perintah:
/start - Tampilkan pesan ini
/help - Bantuan
/random - Ambil hentai acak
/release - Rilisan terbaru
/search <kata> - Cari hentai`;
  bot.sendMessage(chatId, welcome);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const help = `Gunakan perintah berikut:
/random → hentai acak
/release → rilisan terbaru
/search <kata> → cari hentai

Detail akan menampilkan cover, sinopsis, genre, rating, views, ukuran, dan link download.`;
  bot.sendMessage(chatId, help);
});

bot.onText(/\/random/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const data = await nekobocc.random();
    const caption = formatDetailedMetadata(data);
    sendWithPhotoOrText(chatId, data.img, caption);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Gagal mengambil data random.');
  }
});

bot.onText(/\/release/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const releases = await nekobocc.release();
    for (const item of releases) {
      const meta = await nekobocc.get(item.url);
      const caption = formatDetailedMetadata(meta);
      sendWithPhotoOrText(chatId, meta.img, caption);
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Gagal mengambil rilisan terbaru.');
  }
});

bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];
  try {
    const results = await nekobocc.search(query);
    if (results.length === 0) {
      bot.sendMessage(chatId, 'Tidak ada hasil ditemukan.');
      return;
    }
    for (const item of results) {
      const meta = await nekobocc.get(item.url);
      const caption = formatDetailedMetadata(meta);
      sendWithPhotoOrText(chatId, meta.img, caption);
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Gagal mencari data.');
  }
});

console.log('NekoBot aktif!');
