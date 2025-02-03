FROM node:18-alpine

# Устанавливаем bash
RUN apk add --no-cache bash

WORKDIR /usr/src/app

# Копируем файлы зависимостей
COPY package*.json ./

RUN npm install

# Копируем wait-for-it.sh в рабочую директорию
COPY wait-for-it.sh ./

# Делаем скрипт исполняемым
RUN chmod +x wait-for-it.sh

# Копируем остальной исходный код
COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
