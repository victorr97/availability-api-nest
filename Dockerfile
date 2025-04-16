# Usa una imagen ligera y actual de Node.js
FROM node:23.11.0-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración necesarios
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código al contenedor
COPY . .

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 3002

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:dev"]