FROM node:20

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080
EXPOSE 3000
EXPOSE 5173

CMD [ "npm", "run", "dev"]