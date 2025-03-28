document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('trainForm');
    
    // Fonction pour ajouter une gare
    window.addStop = function() {
        const container = document.getElementById('stopsContainer');
        const div = document.createElement('div');
        div.className = 'flex space-x-2';
        div.innerHTML = `
            <input type="text" class="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sncf focus:border-sncf">
            <button type="button" onclick="removeStop(this)" class="px-3 py-1 bg-red-500 text-white rounded-md">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    };

    // Fonction pour supprimer une gare
    window.removeStop = function(button) {
        button.parentElement.remove();
    };

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupération des données
        const trainData = {
            train_number: document.getElementById('trainNumber').value,
            departure_station: document.getElementById('departureStation').value,
            arrival_station: document.getElementById('arrivalStation').value,
            departure_time: document.getElementById('departureTime').value,
            arrival_time: document.getElementById('arrivalTime').value,
            platform: document.getElementById('platform').value,
            stops: Array.from(document.querySelectorAll('#stopsContainer input')).map(input => input.value),
            days: Array.from(document.querySelectorAll('input[name="days"]:checked')).map(checkbox => parseInt(checkbox.value))
        };

        // Validation des données
        if (trainData.stops.some(stop => !stop.trim())) {
            alert('Veuillez remplir toutes les gares desservies');
            return;
        }

        if (trainData.days.length === 0) {
            alert('Veuillez sélectionner au moins un jour de circulation');
            return;
        }

        // Envoi à l'API
        fetch('api/add_train.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trainData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Train enregistré avec succès ! ID: ' + data.train_id);
                form.reset();
                document.getElementById('stopsContainer').innerHTML = '';
                addStop(); // Réinitialiser avec une gare vide
            } else {
                alert('Erreur: ' + (data.error || 'Erreur inconnue'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Erreur lors de l\'envoi des données');
        });
    });

    // Ajouter une première gare par défaut
    addStop();
});

// Configuration Tailwind
tailwind.config = {
    theme: {
        extend: {
            colors: {
                sncf: '#E2001A',
                'sncf-dark': '#C40016'
            }
        }
    }
}