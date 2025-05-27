NekoBot

Bot Telegram untuk mencari rilisan hentai dari Nekopoi via `nekobocc`.

## Perintah

- /start → Tampilkan pesan pembuka
- /help → Bantuan perintah
- /random → Ambil hentai acak
- /release → Rilisan terbaru
- /search <kata> → Cari hentai

## Deploy to Koyeb

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=https://github.com/kucingpulung/NekoBot&branch=main&name=nekobot)

> Pastikan kamu sudah:
> - Menyiapkan variabel lingkungan (environment variable):
>   - `TOKEN` → masukkan token bot Telegram kamu

## Dummy Server

Sudah disiapkan dummy Express server di `index.js` agar bot tetap hidup dan bisa dipantau via UptimeRobot atau health check Koyeb.

## Cara Jalankan Lokal

```bash
git clone https://github.com/kucingpulung/NekoBot.git
cd NekoBot
npm install
TOKEN=your_bot_token npm start
