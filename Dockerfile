
FROM node:18.15



WORKDIR /app


COPY package*.json ./
COPY tsconfig*.json ./


RUN npm install

COPY . .

EXPOSE 9996

CMD ["node", "dist/src/main"]
