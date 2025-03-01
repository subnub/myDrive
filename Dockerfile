FROM node:20-alpine

RUN apk add --no-cache python3 make g++ ffmpeg \
    && ln -sf python3 /usr/bin/python

ENV FS_DIRECTORY=/data/
ENV TEMP_DIRECTORY=/temp/

WORKDIR /usr/app-production

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Default Ports
EXPOSE 8080
EXPOSE 3000

CMD [ "npm", "run", "start"]