document.addEventListener("DOMContentLoaded", function () {
    const filmsContainer = document.getElementById("filmsContainer");
    const importButton = document.getElementById("importButton");
    const countrySelect = document.getElementById("countrySelect");
    const filmTypeSelect = document.getElementById("filmTypeSelect");
    const classicThresholdInput = document.getElementById("classicThreshold");
    const navetThresholdInput = document.getElementById("navetThreshold");
    const classicValue = document.getElementById("classicValue");
    const navetValue = document.getElementById("navetValue");
    const addFilmForm = document.getElementById("addFilmForm");
    const addFilmButton = document.getElementById("addFilmButton");
    const cancelButton = document.querySelector("#addFilmForm .cancel-button");

    let filmsData = [];
    let filteredFilms = [];
    let editingFilmId = null; // Variable pour stocker l'ID du film en cours d'édition

    // Mise à jour des valeurs affichées pour les seuils
    classicThresholdInput.addEventListener("input", function() {
        classicValue.textContent = this.value;
    });
    
    navetThresholdInput.addEventListener("input", function() {
        navetValue.textContent = this.value;
    });
    
    // Initialiser les valeurs affichées
    classicValue.textContent = classicThresholdInput.value;
    navetValue.textContent = navetThresholdInput.value;

    // Fonction pour mettre à jour l'affichage des films
    function updateFilmDisplay() {
        filmsContainer.innerHTML = "";
        
        if (filteredFilms.length === 0) {
            filmsContainer.innerHTML = "<p class='no-results'>Aucun film ne correspond à vos critères.</p>";
            return;
        }

        const classicThreshold = parseFloat(classicThresholdInput.value);
        const navetThreshold = parseFloat(navetThresholdInput.value);

        filteredFilms.forEach(film => {
            const imageSrc = film.lienImage ? film.lienImage : "img/default.jpg";
            const isMasterpiece = film.note >= classicThreshold;
            const isNavet = film.note <= navetThreshold;

            const filmCard = document.createElement("div");
            filmCard.classList.add("film-card");
            filmCard.dataset.id = film.id;

            // Ajouter un bouton d'édition et un bouton de suppression
            const editButton = `<button class="edit-button" data-id="${film.id}">✏️ Modifier</button>`;
            const deleteButton = `<button class="delete-button" data-id="${film.id}">🗑️ Supprimer</button>`;
            
            const buttons = `<div class="film-buttons">${editButton} ${deleteButton}</div>`;

            if (isNavet) {
                filmCard.classList.add("navet");
                filmCard.innerHTML = `
                    <img src="${imageSrc}" alt="${film.nom}">
                    <h2>${film.nom}</h2>
                    <p class="navet-text">Ne vaut même pas la peine</p>
                    ${buttons}
                `;
            } else if (isMasterpiece) {
                filmCard.classList.add("masterpiece");
                filmCard.innerHTML = `
                    <img src="${imageSrc}" alt="${film.nom}">
                    <h2>${film.nom}</h2>
                    <p><strong>Année :</strong> ${film.dateDeSortie}</p>
                    <p><strong>Réalisateur :</strong> ${film.realisateur}</p>
                    <p><strong>Note :</strong> ${film.note}</p>
                    <p><strong>Compagnie :</strong> ${film.compagnie}</p>
                    <p><strong>Origine :</strong> ${film.origine || "Non spécifiée"}</p>
                    <p>${film.description}</p>
                    <p class="masterpiece-text">Un chef-d'œuvre incontournable</p>
                    ${buttons}
                `;
            } else {
                filmCard.innerHTML = `
                    <img src="${imageSrc}" alt="${film.nom}">
                    <h2>${film.nom}</h2>
                    <p><strong>Année :</strong> ${film.dateDeSortie}</p>
                    <p><strong>Réalisateur :</strong> ${film.realisateur}</p>
                    <p><strong>Note :</strong> ${film.note}</p>
                    <p><strong>Compagnie :</strong> ${film.compagnie}</p>
                    <p><strong>Origine :</strong> ${film.origine || "Non spécifiée"}</p>
                    <p>${film.description}</p>
                    ${buttons}
                `;
            }

            filmsContainer.appendChild(filmCard);
        });

        // Ajouter des écouteurs d'événements pour les boutons de suppression
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const filmId = this.getAttribute('data-id');
                if (!filmId) return;
                
                const filmCard = this.closest('.film-card');
                if (filmCard) filmCard.classList.add('deleting');
                
                supprimerFilm(filmId);
            });
        });
        
        // Ajouter des écouteurs d'événements pour les boutons d'édition
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function() {
                const filmId = this.getAttribute('data-id');
                if (!filmId) return;
                
                editFilm(filmId);
            });
        });
    }

    // Fonction pour importer les films depuis le serveur avec des filtres
    function importFilms() {
        const selectedCountry = countrySelect.value;
        const selectedFilmType = filmTypeSelect.value;
        const classicThreshold = parseFloat(classicThresholdInput.value);
        const navetThreshold = parseFloat(navetThresholdInput.value);

        // Construire l'URL avec les paramètres de filtrage
        let url = "/films";
        const params = [];

        if (selectedCountry && selectedCountry !== "all") {
            params.push(`origine=${selectedCountry}`);
        }

        if (selectedFilmType && selectedFilmType !== "all") {
            params.push(`niveau=${selectedFilmType}`);
        } else {
            // Si aucun type spécifique n'est sélectionné, on n'envoie pas les seuils personnalisés
            // Les seuils personnalisés seront appliqués côté client pour la coloration
        }

        // Ajouter les paramètres à l'URL s'il y en a
        if (params.length > 0) {
            url += "?" + params.join("&");
        }
        
        console.log("Requête avec filtres:", url);

        // Afficher un indicateur de chargement
        filmsContainer.innerHTML = "<div class='loading'>Chargement des films...</div>";

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(films => {
                console.log("Films reçus du serveur:", films);
                filmsData = films;
                filteredFilms = films;
                updateFilmDisplay();
            })
            .catch(error => {
                console.error("Erreur lors du chargement des films:", error);
                filmsContainer.innerHTML = `<div class="error">Erreur de chargement des films: ${error.message}</div>`;
            });
    }

    // Fonction pour supprimer un film
    function deleteFilm(rowid, instance) {
        if (!rowid) {
            console.error("Attempting to delete with invalid rowid:", rowid);
            return;
        }

        console.log('Sending delete request for rowid:', rowid);
        
        fetch(`/film/${rowid}`, {
            method: 'DELETE'
        })
        .then(response => {
            console.log('Delete response:', response.status);
            if (response.ok) {
                console.log('Delete successful');
                instance.closest('.film-card').remove();
                importFilms();
            } else {
                console.error('Delete failed:', response.statusText);
                alert("Erreur lors de la suppression du film");
            }
        })
        .catch(error => {
            console.error("Delete error:", error);
            alert("Erreur lors de la suppression du film");
        });
    }

    // Fonction pour pré-remplir le formulaire avec les données du film à éditer
    function editFilm(filmId) {
        // Trouver le film dans les données
        const film = filteredFilms.find(f => f.id == filmId);
        if (!film) {
            console.error("Film non trouvé avec l'ID:", filmId);
            return;
        }
        
        // Stocker l'ID du film en cours d'édition
        editingFilmId = filmId;
        
        // Changer le titre du formulaire et le texte du bouton
        document.getElementById("formTitle").textContent = "Modifier un film";
        document.getElementById("submitButton").textContent = "Enregistrer les modifications";
        
        // Pré-remplir le formulaire avec les données du film
        document.getElementById("nom").value = film.nom || "";
        document.getElementById("dateDeSortie").value = film.dateDeSortie || "";
        document.getElementById("realisateur").value = film.realisateur || "";
        document.getElementById("note").value = film.note || "";
        document.getElementById("compagnie").value = film.compagnie || "";
        document.getElementById("description").value = film.description || "";
        document.getElementById("lienImage").value = film.lienImage || "";
        
        // Sélectionner l'origine
        const origineSelect = document.getElementById("origine");
        for (let i = 0; i < origineSelect.options.length; i++) {
            if (origineSelect.options[i].value === film.origine) {
                origineSelect.selectedIndex = i;
                break;
            }
        }
        
        // Afficher le formulaire
        addFilmForm.style.display = 'block';
    }

    // Fonction modifiée pour ajouter ou mettre à jour un film
    function submitFilmForm(event) {
        event.preventDefault();
        const formData = new FormData(addFilmForm);
        const filmData = {};
        formData.forEach((value, key) => {
            filmData[key] = value;
        });
        
        // Ajouter l'origine si elle n'est pas spécifiée
        if (!filmData.origine) {
            filmData.origine = countrySelect.value !== 'all' ? countrySelect.value : 'France';
        }
        
        if (editingFilmId) {
            // Mode édition - envoi d'une requête PUT
            fetch(`/film/${editingFilmId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filmData)
            })
            .then(response => {
                if (response.ok) {
                    importFilms();
                    resetForm();
                } else {
                    alert('Échec de la mise à jour du film');
                }
            })
            .catch(error => {
                console.error("Erreur lors de la mise à jour du film:", error);
                alert('Échec de la mise à jour du film');
            });
        } else {
            // Mode ajout - envoi d'une requête POST
            fetch('/film', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filmData)
            })
            .then(response => {
                if (response.ok) {
                    importFilms();
                    resetForm();
                } else {
                    alert('Échec de l\'ajout du film');
                }
            })
            .catch(error => {
                console.error("Erreur lors de l'ajout du film:", error);
                alert('Échec de l\'ajout du film');
            });
        }
    }

    // Fonction pour réinitialiser le formulaire
    function resetForm() {
        editingFilmId = null;
        document.getElementById("formTitle").textContent = "Ajouter un nouveau film";
        document.getElementById("submitButton").textContent = "Ajouter le film";
        addFilmForm.reset();
        addFilmForm.style.display = 'none';
    }

    // Écouteurs d'événements
    addFilmButton.addEventListener("click", () => {
        resetForm();
        addFilmForm.style.display = 'block';
    });

    cancelButton.addEventListener("click", () => {
        resetForm();
    });

    // Remplacer l'événement d'écoute du formulaire par notre nouvelle fonction
    addFilmForm.addEventListener("submit", submitFilmForm);
    
    // Utiliser le bouton d'importation pour appliquer les filtres
    importButton.addEventListener("click", importFilms);
    
    // Charger les films au démarrage
    importFilms();
});

// Fonction pour afficher les films avec gestion améliorée des images et du texte
function displayFilms(films) {
    filmsContainer.innerHTML = "";
    
    if (films.length === 0) {
        filmsContainer.innerHTML = "<p>Aucun film ne correspond à vos critères.</p>";
        return;
    }
    
    films.forEach(film => {
        const filmCard = document.createElement("div");
        filmCard.classList.add("film-card");
        filmCard.dataset.rowid = film.id;

        const imageUrl = film.lienImage ? film.lienImage : "img/default.jpg";
        
        filmCard.innerHTML = `
            <h2>${film.nom || "Sans titre"}</h2>
            <img src="${imageUrl}" alt="${film.nom}" onload="this.classList.add('loaded')">
            <div class="film-details">
                <p><strong>Réalisateur:</strong> <span>${film.realisateur || "Non spécifié"}</span></p>
                <p><strong>Date:</strong> <span>${film.dateDeSortie || "Non spécifiée"}</span></p>
                <p><strong>Note:</strong> <span>${film.note || "N/A"}/5</span></p>
                <p><strong>Origine:</strong> <span>${film.origine || "Non spécifiée"}</span></p>
            </div>
            <p class="description">${film.description || "Aucune description disponible."}</p>
            <button class="delete-button" data-id="${film.id}">Supprimer</button>
        `;
        
        filmsContainer.appendChild(filmCard);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function() {
            const filmId = this.getAttribute('data-id');
            if (!filmId) return;
            
            // Add a visual feedback
            const filmCard = this.closest('.film-card');
            if (filmCard) filmCard.classList.add('deleting');
            
            supprimerFilm(filmId);
        });
    });
}