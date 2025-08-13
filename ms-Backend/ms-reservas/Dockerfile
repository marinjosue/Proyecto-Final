# Imagen base
FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY package*.json ./
RUN npm install

# Copiar todo lo demás
COPY . .

# Exponer puerto
EXPOSE 3001

# Comando por defecto
CMD ["npm", "start"]
