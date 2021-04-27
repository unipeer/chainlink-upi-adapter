FROM node:alpine

WORKDIR /upi-adapter
RUN apk add --no-cache git python make gcc g++ libc-dev

COPY package.json .
COPY package-lock.json .
RUN npm install

ADD . .
RUN npm run build

ENV EA_PORT=8080

CMD node ./dist/server.js
