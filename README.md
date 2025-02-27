# Catalogue Films

Un catalogue interactif de films avec des fonctionnalités de filtrage et de tri avancées.

## Fonctionnalités

- Affichage des films avec leurs détails (nom, réalisateur, date de sortie, note, etc.)
- Filtrage des films par pays d'origine (France, Angleterre, Belgique, Pays-Bas)
- Catégorisation des films selon leur note (Classiques, Standard, Navets)
- Ajout de nouveaux films à la base de données
- Suppression de films existants
- Filtrage côté serveur pour améliorer les performances

## Technologies utilisées

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Base de données**: SQLite3

## Installation

1. Clonez ce dépôt

   ```bash
   git clone https://github.com/Micho776/Catalogue-Films.git
   ```

2. Installez les dépendances

   ```bash
   npm install
   ```

3. Initialisez la base de données

   ```bash
   node initDB.js
   ```

4. Démarrez le serveur

   ```bash
   node server.js
   ```

5. Accédez à l'application dans votre navigateur
   ```
   http://localhost:3000/film.html
   ```

## Structure du projet

- `server.js` - Serveur Express et endpoints API
- `initDB.js` - Script d'initialisation de la base de données
- `film.json` - Données source pour les films
- `public/` - Fichiers frontend
  - `film.html` - Page principale HTML
  - `film.css` - Styles de l'application
  - `film.js` - Code JavaScript frontend
  - `img/` - Images des films

## API REST

- `GET /films` - Récupérer tous les films avec possibilité de filtrage par origine et note
- `POST /film` - Ajouter un nouveau film
- `DELETE /film/:id` - Supprimer un film par son ID
