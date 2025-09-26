# Utiliser l'image officielle de Node.js comme image de base
FROM node:18

# Définir le répertoire de travail dans le conteneur
WORKDIR /server

# Copier les fichiers package.json et package-lock.json (si présent) dans le conteneur
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code de l'application dans le conteneur
COPY . .

# Exposer le port sur lequel le serveur Node.js va écouter (ex: 5000)
EXPOSE 5000

# Démarrer le serveur lorsque le conteneur est lancé
CMD ["npm", "start"]
