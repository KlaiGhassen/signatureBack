FROM node:16

LABEL maintainer="ghassen klai<aghassen.klai@esprit.tn>"

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN chown -R node:node /home/node/app

USER node

EXPOSE 3000

CMD ["node", "server.js"]