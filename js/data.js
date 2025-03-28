// Données mockées des gares
const stations = [
    { id: 1, name: "Dijon-Ville" },
    { id: 2, name: "Besançon-Viotte" },
    { id: 3, name: "Belfort" },
    { id: 4, name: "Montbard" },
    { id: 5, name: "Auxerre" },
    { id: 6, name: "Chalon-sur-Saône" }
];

// Données mockées des horaires
const schedules = [
    { 
        train: "TER 87654", 
        departure: { station: "Dijon-Ville", time: "08:15" }, 
        arrival: { station: "Besançon-Viotte", time: "09:30" },
        stops: ["Dijon-Ville", "Genlis", "Auxonne", "Dole", "Besançon-Viotte"],
        duration: "1h15",
        status: "À l'heure",
        delay: 0
    },
    { 
        train: "TER 76543", 
        departure: { station: "Besançon-Viotte", time: "09:45" }, 
        arrival: { station: "Belfort", time: "10:30" },
        stops: ["Besançon-Viotte", "Baume-les-Dames", "L'Isle-sur-le-Doubs", "Belfort"],
        duration: "0h45",
        status: "Retard 5 min",
        delay: 5
    },
    { 
        train: "TER 65432", 
        departure: { station: "Dijon-Ville", time: "10:20" }, 
        arrival: { station: "Montbard", time: "11:05" },
        stops: ["Dijon-Ville", "Is-sur-Tille", "Les Laumes-Alésia", "Montbard"],
        duration: "0h45",
        status: "Supprimé",
        delay: null
    },
    { 
        train: "TER 54321", 
        departure: { station: "Auxerre", time: "11:10" }, 
        arrival: { station: "Dijon-Ville", time: "12:40" },
        stops: ["Auxerre", "Laroche-Migennes", "Montbard", "Dijon-Ville"],
        duration: "1h30",
        status: "À l'heure",
        delay: 0
    }
];

// Export pour utilisation dans app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { stations, schedules };
} else {
    window.trainData = { stations, schedules };
}