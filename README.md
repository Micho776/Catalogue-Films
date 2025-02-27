# Films Catalog

A web application for managing and displaying a catalog of films. Users can browse films, filter by country, add new films, and delete existing ones.

## Features

- View a catalog of films with their details
- Filter films by country of origin
- Add new films to the catalog
- Delete films from the catalog
- Highlight masterpieces and low-rated films

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: SQLite3

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Initialize the database:
   ```
   node initDB.js
   ```
4. Start the server:
   ```
   node server.js
   ```
5. Access the application at `http://localhost:3000`

## Project Structure

- `server.js` - Express server and API endpoints
- `initDB.js` - Database initialization script
- `film.json` - Source data for films
- `public/` - Frontend files
  - `film.html` - Main HTML page
  - `film.css` - Styling
  - `film.js` - Frontend JavaScript
  - `img/` - Film images
