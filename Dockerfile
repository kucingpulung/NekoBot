# Gunakan image Node.js versi terbaru
FROM node:20

# Set work directory di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file project
COPY . .

# Ekspos port untuk dummy server (misalnya Express pakai 3000)
EXPOSE 3000

# Jalankan bot
CMD ["npm", "start"]
