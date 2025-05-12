<<<<<<< HEAD
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent
COPY . .
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

FROM node:20-alpine

ENV FS_DIRECTORY=/data/
ENV TEMP_DIRECTORY=/temp/

# Install runtime dependencies
RUN apk add --no-cache ffmpeg

WORKDIR /usr/app-production
COPY --from=builder /usr/app-production .

EXPOSE 8080
EXPOSE 3000
USER node
CMD ["npm", "start"]
=======
FROM node:slim
RUN apt update && apt install -y build-essential python ffmpeg
ARG PORT=3000
ARG REMOTE_URL=http://localhost:3000
ADD . /app
WORKDIR /app
RUN npm install && mkdir config && touch config/prod.env && touch config/.env.production
ENV MONGODB_URL=mongodb://127.0.0.1:27017/personal-drive \
    KEY=youshouldchangeit \
    PASSWORD=youshouldchangeit \
    HTTP_PORT=3000 \
    URL=localhost \
    FULL_URL=http://localhost:3000 \
    ROOT=/ \
    ENABLE_VIDEO_TRANSCODING=true \
    DEBUG=*
RUN npm run build:no-ssl
ENTRYPOINT [ "npm", "run" ]
CMD ["start:no-ssl"]
EXPOSE 3000
>>>>>>> origin/docker-testing
