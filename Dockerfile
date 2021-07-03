FROM ubuntu:20.04
WORKDIR /usr/src

COPY . . 

RUN apt-get -y update && apt-get -y upgrade 
RUN apt-get -y install npm

WORKDIR /usr/src/web
RUN npm i 
RUN npm run build
RUN cp -R ./build ../server/build

WORKDIR /usr/src/server
RUN npm i

ENV PORT=80

EXPOSE 80
CMD ["npm", "start"]
