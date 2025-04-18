FROM node:20-slim

WORKDIR /app

# Instala 'procps' para hot-reload
RUN apt-get update && apt-get install -y procps

# Copia los archivos de configuración
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código
COPY . .

# Expone el puerto necesario para la app
EXPOSE 3002

# Comando para ejecutar la aplicación en modo de desarrollo (hot reload)
CMD ["npm", "run", "start:dev"]