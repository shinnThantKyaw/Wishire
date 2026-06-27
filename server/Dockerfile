FROM node:lts

WORKDIR /app

COPY . .

RUN npm ci

# Prisma generate runs via postinstall hook

CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]
