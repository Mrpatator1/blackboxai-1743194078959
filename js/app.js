async function fetchSchedules() {
    try {
        const response = await fetch('api/get_trains.php');
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
        return data.map(train => ({
            ...train,
            delay: train.status.includes('Retard') ? parseInt(train.status.match(/\d+/)[0]) : 0
        }));
    } catch (error) {
        console.error('Erreur:', error);
        return trainData.schedules; // Fallback aux données mockées
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Initialisation des selects de gares
    const departureSelect = document.getElementById('departure');
    const arrivalSelect = document.getElementById('arrival');
    const timeInput = document.getElementById('time');
    const searchBtn = document.getElementById('search');
    const scheduleTable = document.getElementById('schedule');
    
    // Remplissage des dropdowns avec les gares
    trainData.stations.forEach(station => {
        const option1 = document.createElement('option');
        option1.value = station.name;
        option1.textContent = station.name;
        departureSelect.appendChild(option1.cloneNode(true));
        arrivalSelect.appendChild(option1);
    });

    // Fonction pour afficher les horaires
    function displaySchedules(filteredSchedules = trainData.schedules) {
        scheduleTable.innerHTML = '';
        
        filteredSchedules.forEach(schedule => {
            const row = document.createElement('tr');
            
            // Déterminer la classe CSS en fonction du statut
            let statusClass = 'text-green-600';
            if (schedule.status.includes('Retard')) statusClass = 'text-yellow-600';
            if (schedule.status.includes('Supprimé')) statusClass = 'text-red-600';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium">${schedule.train}</div>
                    <div class="text-xs text-gray-500 mt-1">
                        <i class="fas fa-map-marker-alt mr-1"></i>
                        ${schedule.stops.join(' → ')}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-bold">${schedule.departure.station}</div>
                    <div>${schedule.departure.time}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-bold">${schedule.arrival.station}</div>
                    <div>${schedule.arrival.time}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${schedule.duration}</td>
                <td class="px-6 py-4 whitespace-nowrap ${statusClass}">${schedule.status}</td>
            `;
            
            scheduleTable.appendChild(row);
        });
    }

    // Fonction de filtrage
    function filterSchedules() {
        const departure = departureSelect.value;
        const arrival = arrivalSelect.value;
        const time = timeInput.value;
        
        let filtered = trainData.schedules;
        
        if (departure) {
            filtered = filtered.filter(s => s.departure.station === departure);
        }
        
        if (arrival) {
            filtered = filtered.filter(s => s.arrival.station === arrival);
        }
        
        if (time) {
            filtered = filtered.filter(s => s.departure.time >= time);
        }
        
        displaySchedules(filtered);
    }

    // Écouteurs d'événements
    searchBtn.addEventListener('click', filterSchedules);
    
    // Chargement initial
    try {
        const schedules = await fetchSchedules();
        displaySchedules(schedules);
        
        // Mise à jour périodique
        setInterval(async () => {
            const updated = await fetchSchedules();
            displaySchedules(updated);
        }, 300000); // 5 minutes
    } catch (error) {
        console.error("Erreur:", error);
        displaySchedules(trainData.schedules); // Fallback
    }
});

// Configuration de Tailwind pour la couleur SNCF
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