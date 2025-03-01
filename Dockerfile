FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ ffmpeg && \
    ln -sf python3 /usr/bin/python

WORKDIR /usr/app-production
COPY package*.json ./

RUN npm install

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

CMD ["npm", "run", "start"]
