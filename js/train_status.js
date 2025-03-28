document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchTrain');
    const trainNumberInput = document.getElementById('trainNumber');
    const trainStatusDiv = document.getElementById('trainStatus');
    const notFoundDiv = document.getElementById('notFoundMessage');

    searchBtn.addEventListener('click', async function() {
        const trainNumber = trainNumberInput.value.trim();
        if (!trainNumber) return;

        try {
            const response = await fetch(`api/get_train_status.php?number=${encodeURIComponent(trainNumber)}`);
            const data = await response.json();

            if (data.error) {
                showNotFound();
                return;
            }

            displayTrainStatus(data);
        } catch (error) {
            console.error('Erreur:', error);
            showNotFound();
        }
    });

    function displayTrainStatus(train) {
        // Mettre à jour les informations de base
        document.getElementById('trainNumberHeader').textContent = train.train_number;
        document.getElementById('departureInfo').textContent = `${train.departure_station} à ${train.departure_time}`;
        document.getElementById('arrivalInfo').textContent = `${train.arrival_station} à ${train.arrival_time}`;
        document.getElementById('platformInfo').textContent = train.platform || 'Non spécifié';

        // Mettre à jour le statut
        const statusBadge = document.getElementById('statusBadge');
        const statusDetails = document.getElementById('statusDetails');
        
        statusDetails.innerHTML = '';
        statusBadge.className = 'ml-4 px-3 py-1 rounded-full text-sm font-medium ';

        if (train.status === 'À l\'heure') {
            statusBadge.classList.add('bg-green-100', 'text-green-800');
            statusBadge.textContent = 'À l\'heure';
            statusDetails.innerHTML = '<p class="text-green-600">Le train circule normalement</p>';
        } 
        else if (train.status === 'Retard') {
            statusBadge.classList.add('bg-yellow-100', 'text-yellow-800');
            statusBadge.textContent = `Retard: ${train.delay} min`;
            statusDetails.innerHTML = `
                <p class="text-yellow-600">Retard prévu: ${train.delay} minutes</p>
                <p class="text-gray-700">Cause: ${train.reason || 'Non spécifiée'}</p>
            `;
        }
        else if (train.status === 'Supprimé') {
            statusBadge.classList.add('bg-red-100', 'text-red-800');
            statusBadge.textContent = 'Supprimé';
            statusDetails.innerHTML = `
                <p class="text-red-600">Ce train a été supprimé</p>
                <p class="text-gray-700">Motif: ${train.reason || 'Non spécifié'}</p>
            `;
        }

        // Afficher la section motif si nécessaire
        const reasonSection = document.getElementById('reasonSection');
        const reasonText = document.getElementById('reasonText');
        
        if (train.reason) {
            reasonText.textContent = train.reason;
            reasonSection.classList.remove('hidden');
        } else {
            reasonSection.classList.add('hidden');
        }

        // Afficher le contenu
        trainStatusDiv.classList.remove('hidden');
        notFoundDiv.classList.add('hidden');
    }

    function showNotFound() {
        trainStatusDiv.classList.add('hidden');
        notFoundDiv.classList.remove('hidden');
    }

    // Permettre la recherche avec la touche Entrée
    trainNumberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
});