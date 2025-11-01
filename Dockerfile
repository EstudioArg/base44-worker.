FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY cron-script.js .

CMD ["node", "cron-script.js"]