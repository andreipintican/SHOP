FROM node:latest

RUN mkdir -p /usr/src/test-web

WORKDIR /usr/src/test-web

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "start"]
