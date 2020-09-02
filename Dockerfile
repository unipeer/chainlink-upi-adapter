FROM node:alpine

WORKDIR /upi-adapter
ADD . .

RUN apk add --no-cache git python make gcc g++ libc-dev
RUN npm install
RUN npm run build

ENV EA_PORT=8080

CMD node ./dist/server.js
