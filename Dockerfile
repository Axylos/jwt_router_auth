FROM arm64v8/node
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only-production
COPY . .

EXPOSE 8080

CMD ["npm", "start"]