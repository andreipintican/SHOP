FROM node:latest

RUN mkdir -p /usr/src/shop-favorites

WORKDIR /usr/src/shop-favorites

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4102

CMD ["npm", "start"]