FROM node:slim
RUN apt update && apt install -y build-essential python ffmpeg
ADD . /app
WORKDIR /app
RUN npm install && mkdir config && touch config/prod.env
ENV PORT=3000 \
    URL=http://localhost:3000 \
    ENABLE_VIDEO_TRANSCODING=true \
    MONGODB_URL=mongodb://127.0.0.1:27017/personal-drive \
    HTTP_PORT=3000 \
    HTTPS_PORT=8080 \
    URL=localhost \
    FULL_URL=http://localhost:3000 \
    ROOT=/storage
RUN npm run build:no-ssl
ENTRYPOINT [ "npm", "run" ]
CMD ["start:no-ssl"]
