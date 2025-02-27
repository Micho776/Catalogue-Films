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

    // Fonction pour mettre à jour l'affichage des films
    function updateFilmDisplay() {
        filmsContainer.innerHTML = "";

        const selectedCountry = countrySelect.value;
        const classicThreshold = parseFloat(classicThresholdInput.value);
        const navetThreshold = parseFloat(navetThresholdInput.value);

        classicValue.textContent = classicThreshold;
        navetValue.textContent = navetThreshold;

        filteredFilms.forEach(film => {
            console.log("Processing film with rowid:", film.id); // Debug ID type
            if (selectedCountry !== "all" && film.origine !== selectedCountry) {
                return;
            }

            const imageSrc = film.lienImage ? film.lienImage : "img/default.jpg";
            const isMasterpiece = film.note >= classicThreshold;
            const isNavet = film.note <= navetThreshold;

            const filmCard = document.createElement("div");
            filmCard.classList.add("film-card");
            filmCard.dataset.rowid = film.id; // Change to use rowid instead of nom
            console.log("Created card with rowid:", film.id); // Debug log for rowid

            // Ensure rowid is present and correct
            if (!film.id) {
                console.error("Film missing rowid:", film);
            }

            // Update the delete button creation to use supprimerFilm function
            const deleteButton = `<button class="delete-button" data-rowid="${film.id}" onclick="supprimerFilm(${film.id})">🗑️ Delete</button>`;

            if (isNavet) {
                filmCard.classList.add("navet");
                filmCard.innerHTML = `
                    <img src="${imageSrc}" alt="${film.nom}">
                    <h2>${film.nom}</h2>
                    <p class="navet-text">Ne vaut même pas la peine</p>
                    ${deleteButton}
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
                    <p>${film.description}</p>
                    <p class="masterpiece-text">Un chef-d'œuvre incontournable</p>
                    ${deleteButton}
                `;
            } else {
                filmCard.innerHTML = `
                    <img src="${imageSrc}" alt="${film.nom}">
                    <h2>${film.nom}</h2>
                    <p><strong>Année :</strong> ${film.dateDeSortie}</p>
                    <p><strong>Réalisateur :</strong> ${film.realisateur}</p>
                    <p><strong>Note :</strong> ${film.note}</p>
                    <p><strong>Compagnie :</strong> ${film.compagnie}</p>
                    <p>${film.description}</p>
                    ${deleteButton}
                `;
            }

            filmsContainer.appendChild(filmCard);
        });

        // Update event listener for delete buttons
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const rowid = this.getAttribute('data-rowid');
                console.log("Delete clicked for rowid:", rowid, typeof rowid);
                
                if (!rowid) {
                    console.error("Missing rowid on button:", button);
                    return;
                }
                
                deleteFilm(rowid, this);
            });
        });
    }

    // Fonction pour importer les films depuis le serveur
    function importFilms() {
        fetch("/films")
            .then(response => {
                console.log("Response received:", response); // Log the response
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(films => {
                console.log("Raw films data:", films); // Debug log to see the raw data
                const selectedFilmType = filmTypeSelect.value;
                const classicThreshold = parseFloat(classicThresholdInput.value);
                const navetThreshold = parseFloat(navetThresholdInput.value);

                filmsData = films.filter(film => film.note !== null);

                if (selectedFilmType === "classics") {
                    filteredFilms = filmsData.filter(film => film.note >= classicThreshold);
                } else if (selectedFilmType === "navets") {
                    filteredFilms = filmsData.filter(film => film.note <= navetThreshold);
                } else {
                    filteredFilms = filmsData;
                }

                console.log("Filtered films:", filteredFilms); // Debug log to see filtered data
                updateFilmDisplay();
            })
            .catch(error => {
                console.error("Erreur lors du chargement des films:", error);
                filmsContainer.innerHTML = `<div class="error">Erreur de chargement des films.</div>`;
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

    // Fonction pour ajouter un film
    function addFilm(event) {
        event.preventDefault();
        const formData = new FormData(addFilmForm);
        const filmData = {};
        formData.forEach((value, key) => {
            filmData[key] = value;
        });

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
                addFilmForm.reset();
                addFilmForm.style.display = 'none';
            } else {
                alert('Failed to add film');
            }
        })
        .catch(error => {
            console.error("Erreur lors de l'ajout du film:", error);
            alert('Failed to add film');
        });
    }

    // Écouteurs d'événements
    addFilmButton.addEventListener("click", () => {
        addFilmForm.style.display = 'block';
    });

    cancelButton.addEventListener("click", () => {
        addFilmForm.style.display = 'none';
    });

    importButton.addEventListener("click", importFilms);
    countrySelect.addEventListener("change", updateFilmDisplay);
    addFilmForm.addEventListener("submit", addFilm);
});