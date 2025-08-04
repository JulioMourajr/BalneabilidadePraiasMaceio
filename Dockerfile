FROM node:20-slim

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar todo o código
COPY . .

EXPOSE 5173

CMD [ "npm", "start" ]