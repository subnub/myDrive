FROM node

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8000

RUN npm run start