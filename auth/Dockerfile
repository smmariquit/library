FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3001
CMD ["sh", "-c", "npm run migrate && npm run start"]
