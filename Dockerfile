FROM node:14
WORKDIR /usr/src

RUN npm i yarn -g

WORKDIR /usr/src/web

COPY /web/package*.json .
RUN yarn

WORKDIR /usr/src/server

COPY /server/package*.json .
RUN yarn

COPY . /usr/src

WORKDIR /usr/src/web

RUN yarn build
RUN cp -R ./build ../server/build

WORKDIR /usr/src/server

ENV PORT=80

EXPOSE 80
CMD yarn start
