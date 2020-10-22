FROM node:14.13.1-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY dist/ ./

CMD ["node", "server.js"]