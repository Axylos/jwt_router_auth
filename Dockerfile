FROM arm64v8/node:9.11.1-alpine
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only-production
COPY . .

EXPOSE 8080

CMD ["npm", "start"]
