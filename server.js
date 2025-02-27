const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// Connect to SQLite database
const db = new sqlite3.Database('./films.db', (err) => {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        console.log("Successfully connected to database");
        
        // Initialize database if films table doesn't exist
        initializeDatabase();
    }
});

// Initialize database
function initializeDatabase() {
    // Check if the films table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='films'", (err, row) => {
        if (err) {
            console.error("Error checking for films table:", err);
            return;
        }
        
        // Si la table n'existe pas, exécuter initDB.js
        if (!row) {
            console.log("Films table not found. Please run initDB.js first.");
        } else {
            console.log("Films table already exists in database");
        }
    });
}

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route modifiée pour récupérer les films avec filtrage
app.get('/films', (req, res) => {
    const origine = req.query.origine;
    const niveau = req.query.niveau;
    const noteMin = req.query.noteMin;
    const noteMax = req.query.noteMax;
    
    console.log("Filtres reçus:", { origine, niveau, noteMin, noteMax });
    
    // Construire la requête SQL avec les filtres
    let query = "SELECT id, * FROM films WHERE 1=1";
    let params = [];
    
    // Filtrer par origine
    if (origine && origine !== "all") {
        query += " AND origine = ?";
        params.push(origine);
    }
    
    // Filtrer par note minimale
    if (noteMin) {
        query += " AND note >= ?";
        params.push(parseFloat(noteMin));
    }
    
    // Filtrer par note maximale
    if (noteMax) {
        query += " AND note <= ?";
        params.push(parseFloat(noteMax));
    }
    
    // Filtrer par niveau (Classic, Standard, Navet)
    if (niveau) {
        if (niveau === "classics") {
            query += " AND note >= 4.0"; // Seuil pour les classiques
        } else if (niveau === "navets") {
            query += " AND note <= 2.0"; // Seuil pour les navets
        } else if (niveau === "standard") {
            query += " AND note > 2.0 AND note < 4.0"; // Films entre les deux seuils
        }
    }

    console.log("SQL Query:", query, "with params:", params);
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error reading films:', err);
            return res.status(500).json({ error: 'Failed to read films' });
        }
        console.log(`Retrieved ${rows.length} films with filters`);
        res.json(rows);
    });
});

// Route to add a new film
app.post('/film', (req, res) => {
    const { nom, dateDeSortie, realisateur, note, compagnie, description, lienImage, origine } = req.body;
    
    db.run(`INSERT INTO films (nom, dateDeSortie, realisateur, note, compagnie, description, lienImage, origine) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        [nom, dateDeSortie, realisateur, note, compagnie, description, lienImage, origine || 'France'], 
        function(err) {
            if (err) {
                console.error('Error adding film:', err);
                return res.status(500).json({ error: 'Failed to add film' });
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Route to delete a film
app.delete('/film/:id', (req, res) => {
    const id = req.params.id;
    console.log(`Attempting to delete film with ID: ${id}`);
    
    db.run('DELETE FROM films WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting film:', err);
            return res.status(500).json({ error: 'Failed to delete film' });
        }
        
        if (this.changes === 0) {
            console.log(`No film found with ID: ${id}`);
            return res.json({ success: true, message: 'Film not found but no error occurred' });
        }
        
        console.log(`Successfully deleted film with ID: ${id}`);
        res.json({ success: true, message: 'Film deleted successfully' });
    });
});

// Simple diagnostic route
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});