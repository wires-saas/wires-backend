FROM node:lts

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY dist ./

COPY .env ./

USER node

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "node", "dist/main" ]