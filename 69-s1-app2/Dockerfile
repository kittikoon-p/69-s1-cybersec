FROM node:22

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build && npm prune --omit=dev && npm cache clean --force

ENV NODE_ENV=production
EXPOSE 1337

RUN chown -R node:node /opt/app
USER node

CMD ["npm", "start"]
