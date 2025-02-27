const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('Starting database initialization...');

// Delete existing database file if it exists
try {
    if (fs.existsSync('./films.db')) {
        fs.unlinkSync('./films.db');
        console.log('Removed existing database file');
    }
} catch (err) {
    console.error('Error removing database file:', err);
}

// Create new database
const db = new sqlite3.Database('./films.db', (err) => {
    if (err) {
        return console.error('Error creating database:', err);
    }
    console.log('Connected to database');

    // Create films table with an auto-incremented ID
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
            return console.error('Error creating table:', err);
        }
        console.log('Films table created');

        // Read JSON data file
        fs.readFile('./film.json', 'utf8', (err, data) => {
            if (err) {
                return console.error('Error reading JSON file:', err);
            }

            try {
                const films = JSON.parse(data);
                console.log(`Parsed ${films.length} films from JSON`);

                // Begin transaction
                db.run('BEGIN TRANSACTION');

                // Insert each film
                let inserted = 0;
                
                films.forEach((film) => {
                    db.run(`
                        INSERT INTO films (nom, dateDeSortie, realisateur, note, compagnie, description, lienImage, origine)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        film.nom || '',
                        film.dateDeSortie || '',
                        film.realisateur || '',
                        film.note || 0,
                        film.compagnie || '',
                        film.description || '',
                        film.lienImage || '',
                        film.origine || ''
                    ], function(err) {
                        if (err) {
                            console.error(`Error inserting film "${film.nom}":`, err);
                        } else {
                            inserted++;
                            console.log(`Inserted film: ${film.nom} (${inserted}/${films.length})`);
                        }
                    });
                });

                // Commit transaction and verify data
                db.run('COMMIT', (err) => {
                    if (err) {
                        return console.error('Error committing transaction:', err);
                    }
                    
                    console.log('All films inserted successfully');
                    
                    // Verify data was inserted
                    db.all('SELECT id, nom FROM films', [], (err, rows) => {
                        if (err) {
                            console.error('Error verifying data:', err);
                        } else {
                            console.log(`Database now contains ${rows.length} films`);
                            rows.slice(0, 5).forEach(row => {
                                console.log(`- ID ${row.id}: ${row.nom}`);
                            });
                        }
                        
                        // Close database connection
                        db.close((err) => {
                            if (err) {
                                return console.error('Error closing database:', err);
                            }
                            console.log('Database initialization complete!');
                        });
                    });
                });
                
            } catch (err) {
                console.error('Error parsing JSON:', err);
                db.close();
            }
        });
    });
});