FROM node:iron-alpine as runner

USER node

WORKDIR '/app'

COPY --chown=node:node . .

RUN npm i

CMD [ "npm", "start" ]