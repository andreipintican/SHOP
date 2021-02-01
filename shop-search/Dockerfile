FROM node:latest

RUN mkdir -p /usr/src/shop-search

WORKDIR /usr/src/shop-search

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4101

CMD ["npm", "start"]