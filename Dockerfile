FROM node:latest
# node:lts-alpine causing problems with node-gyp

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node dist ./
COPY --chown=node:node .env ./
COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD [ "node", "dist/src/main" ]