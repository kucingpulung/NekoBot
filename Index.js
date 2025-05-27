import TelegramBot from 'node-telegram-bot-api';
import NekoBocc from 'nekobocc';
import express from 'express';

const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });
const nekobocc = new NekoBocc();

// Dummy server untuk Koyeb & Uptimerobot
const app = express();
app.get('/', (req, res) => res.send('NekoBot is alive!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const formatGenres = (genres) => {
  return genres && genres.length
    ? genres.map((g) => `#${g.replace(/\s+/g, '')}`).join(' ')
    : '';
};

const formatDetailedMetadata = (data) => {
  const fields = [
    data.status && `<b>Status:</b> ${escapeHtml(data.status)}`,
    data.episode && `<b>Episode:</b> ${escapeHtml(data.episode)}`,
    data.aired && `<b>Tayang:</b> ${escapeHtml(data.aired)}`,
    data.duration && `<b>Durasi:</b> ${escapeHtml(data.duration)}`,
    data.score && `<b>Score:</b> ${escapeHtml(data.score)}`,
    data.views && `<b>Views:</b> ${escapeHtml(data.views)}`,
    data.producer && data.producer.length ? `<b>Produser:</b> ${escapeHtml(data.producer.join(', '))}` : '',
    data.genre && data.genre.length ? `<b>Genre:</b> ${formatGenres(data.genre)}` : '',
  ].filter(Boolean).join('\n');

  const sizeInfo = data.size
    ? Object.entries(data.size).map(([res, size]) => `${res}: ${size}`).join('\n')
    : '';

  const urls = Array.isArray(data.url)
    ? data.url.map((u, i) => `<a href="${u}">Episode ${i + 1}</a>`).join('\n')
    : (data.url || '');

  return `<b>${escapeHtml(data.title)}</b>\n\n${fields}\n\n<b>Sinopsis:</b>\n${escapeHtml(data.synopsis)}\n\n<b>Ukuran File:</b>\n${escapeHtml(sizeInfo)}\n\n<b>Link Episode:</b>\n${urls}`;
};

const sendWithPhotoOrText = (chatId, imgUrl, caption, downloadLinks = {}) => {
  const buttons = Object.keys(downloadLinks).map((res) => [{
    text: `${res.toUpperCase()} Download`,
    url: downloadLinks[res][0],
  }]);

  if (imgUrl) {
    bot.sendPhoto(chatId, imgUrl, {
      caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    }).catch(err => {
      console.error('Gagal kirim foto:', err);
      bot.sendMessage(chatId, caption, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      });
    });
  } else {
    bot.sendMessage(chatId, caption, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  }
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcome = `Halo ${msg.from.first_name}! Aku <b>NekoBot</b>.\n\nPerintah:\n/start - Tampilkan pesan ini\n/help - Bantuan\n/random - Ambil hentai acak\n/release - Rilisan terbaru\n/search <kata> - Cari hentai`;
  bot.sendMessage(chatId, welcome, { parse_mode: 'HTML' });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const help = `Gunakan perintah berikut:\n/random → hentai acak\n/release → rilisan terbaru\n/search <kata> → cari hentai\nDetail akan menampilkan cover, sinopsis, genre, rating, views, ukuran, dan link download.`;
  bot.sendMessage(chatId, help, { parse_mode: 'HTML' });
});

bot.onText(/\/random/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const data = await nekobocc.random();
    const caption = formatDetailedMetadata(data);
    sendWithPhotoOrText(chatId, data.img, caption, data.download);
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
      sendWithPhotoOrText(chatId, meta.img, caption, meta.download);
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
      sendWithPhotoOrText(chatId, meta.img, caption, meta.download);
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Gagal mencari data.');
  }
});

console.log('NekoBot aktif!');
