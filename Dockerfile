FROM node:slim
RUN apt update && apt install -y build-essential python ffmpeg
ADD . /app
WORKDIR /app
RUN npm install && mkdir config && touch config/prod.env
# Server ENV
ENV MONGODB_URL=mongodb://127.0.0.1:27017/personal-drive \
    KEY=youshouldchangeit \
    HTTP_PORT=3000 \
    HTTPS_PORT=8080 \
    URL=localhost \
    FULL_URL=http://localhost:3000 \
    ROOT=/storage \
    ENABLE_VIDEO_TRANSCODING=true
# Client ENV
ENV PORT=3000 \
    REMOTE_URL=http://localhost:3000
RUN npm run build:no-ssl
ENTRYPOINT [ "npm", "run" ]
CMD ["start:no-ssl"]
