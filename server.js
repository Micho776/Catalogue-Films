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
        
        // If the table doesn't exist, create it and populate with data
        if (!row) {
            console.log("Films table not found. Creating and populating it...");
            
            // Create the films table with auto-incremented ID
            db.run(`
                CREATE TABLE films (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nom TEXT NOT NULL,
                    dateDeSortie TEXT,
                    realisateur TEXT,
                    note REAL,
                    compagnie TEXT,
                    description TEXT,
                    lienImage TEXT,
                    origine TEXT
                )
            `, (err) => {
                if (err) {
                    console.error("Error creating films table:", err);
                    return;
                }
                
                console.log("Films table created successfully");
                
                // Read the JSON file and insert data
                try {
                    const data = fs.readFileSync('./film.json', 'utf8');
                    const films = JSON.parse(data);
                    
                    console.log(`Loading ${films.length} films into database...`);
                    
                    // Begin transaction
                    db.run("BEGIN TRANSACTION");
                    
                    // Prepare the insert statement
                    const stmt = db.prepare(`
                        INSERT INTO films (nom, dateDeSortie, realisateur, note, compagnie, description, lienImage, origine)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `);
                    
                    // Insert each film
                    films.forEach((film) => {
                        stmt.run(
                            film.nom || '',
                            film.dateDeSortie || '',
                            film.realisateur || '',
                            film.note || 0,
                            film.compagnie || '',
                            film.description || '',
                            film.lienImage || '',
                            film.origine || ''
                        );
                    });
                    
                    stmt.finalize();
                    
                    // Commit the transaction
                    db.run("COMMIT", (err) => {
                        if (err) {
                            console.error("Error committing transaction:", err);
                        } else {
                            console.log("Database populated successfully");
                        }
                    });
                    
                } catch (err) {
                    console.error("Error loading data from JSON:", err);
                }
            });
        } else {
            console.log("Films table already exists in database");
        }
    });
}

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route to get all films
app.get('/films', (req, res) => {
    db.all("SELECT * FROM films", [], (err, rows) => {
        if (err) {
            console.error('Error reading films:', err);
            return res.status(500).json({ error: 'Failed to read films' });
        }
        console.log(`Retrieved ${rows.length} films`);
        res.json(rows);
    });
});

// Route to add a new film
app.post('/film', (req, res) => {
    const { nom, dateDeSortie, realisateur, note, compagnie, description, lienImage, origine } = req.body;
    
    db.run(`INSERT INTO films (nom, dateDeSortie, realisateur, note, compagnie, description, lienImage, origine) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        [nom, dateDeSortie, realisateur, note, compagnie, description, lienImage, origine], 
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
            return res.status(404).json({ error: 'Film not found' });
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