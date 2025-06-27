FROM node:20-bullseye AS builder

# Install build dependencies
RUN apt-get update && \
    apt-get install -y python3 make g++ ffmpeg tesseract-ocr libtesseract-dev libleptonica-dev pkg-config ca-certificates && \
    ln -sf python3 /usr/bin/python3

WORKDIR /usr/app-production
COPY package*.json ./

RUN npm install

COPY . .
COPY .env ./backend/config/.env.production
RUN npm run build


# Remove dev dependencies
RUN npm prune --production

FROM node:20-bullseye

ENV FS_DIRECTORY=/data/
ENV TEMP_DIRECTORY=/temp/

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg tesseract-ocr libtesseract-dev libleptonica-dev pkg-config ca-certificates

WORKDIR /usr/app-production
COPY --from=builder /usr/app-production .

EXPOSE 8080
EXPOSE 3000
EXPOSE 80
CMD ["npm", "run", "start"]
