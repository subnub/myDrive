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
