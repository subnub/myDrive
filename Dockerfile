FROM node:13

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build:docker

EXPOSE 8080
EXPOSE 3000

CMD [ "npm", "run", "start"]