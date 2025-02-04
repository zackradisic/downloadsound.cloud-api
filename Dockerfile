FROM node:14.13.1-alpine

WORKDIR /usr/src/app

ENV PROD "true"

COPY package*.json ./

RUN npm install --only=production

COPY dist/ ./

COPY secrets/ ./secrets/

CMD ["node", "server.js"]