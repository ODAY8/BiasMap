FROM node:20-bookworm-slim
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src
COPY database ./database
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.js"]
