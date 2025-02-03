FROM node:23.6.0

WORKDIR /usr/src/app

# Копируем файлы зависимостей
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
