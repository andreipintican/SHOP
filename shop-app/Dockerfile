FROM node:latest

RUN mkdir -p /usr/src/shop-app

WORKDIR /usr/src/shop-app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4100

CMD ["npm", "start"]