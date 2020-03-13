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
    DEBUG=app
RUN npm run build:no-ssl
ENTRYPOINT [ "npm", "run" ]
CMD ["start:no-ssl"]
EXPOSE 3000
