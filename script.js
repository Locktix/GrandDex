// Configuration des types pour chaque catégorie
const TYPE_CONFIG = {
    'pokemon-items': [
        'Display', 'Demi-Display', 'ETB', 'UPC', 
        'Coffret normal', 'coffret poster', 'coffret classeur',
        'Display mini tin', 'mini tin',
        'Display Bundle', 'Bundle',
        'Booster', 'Duo-pack', 'Tri-pack', 'Blister',
        'Art-Set booster', 'Art-Set Blister',
        'Valisette'
    ],
    'pokemon-cards': [
        'AR', 'FA', 'ALT', 'V', 'VMAX', 'VSTAR', 'GOLD', 'GX', 'Promo', 'EX', 'Shiny'
    ],
    'pokemon-graded': [
        'AR', 'FA', 'ALT', 'V', 'VMAX', 'VSTAR', 'GOLD', 'GX', 'Promo', 'EX', 'Shiny'
    ],
    'onepiece-items': [
        'Display', 'ETB', 'Booster', 'Mini Tin', 'Display Mini Tins', 'Coffret'
    ],
    'onepiece-graded': [
        'SR', 'SEC', 'L', 'SP', 'PL'
    ]
};

const ETAT_CONFIG = {
    'pokemon-items': ['Scellé', 'Non scellé', 'Nevermint', 'En loose', 'Défaut'],
    'pokemon-cards': ['Mint', 'Near Mint', 'Excellent', 'Good', 'Semi Good', 'Bad', 'Very Bad'],
    'pokemon-graded': ['Mint', 'Near Mint', 'Excellent', 'Good', 'Semi Good', 'Bad', 'Very Bad'],
    'onepiece-items': ['Scellé', 'Non scellé', 'Nevermint', 'En loose', 'Défaut'],
    'onepiece-graded': ['Mint', 'Near Mint', 'Excellent', 'Good', 'Semi Good', 'Bad', 'Very Bad']
};

// Variables globales
let currentData = {
    'pokemon-items': [],
    'pokemon-cards': [],
    'pokemon-graded': [],
    'onepiece-items': [],
    'onepiece-graded': []
};

let currentEditingId = null;
let currentCategory = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadData();
    setupEventListeners();
    setupCharts();
    updateDashboard();
}

// Gestion des événements
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Formulaire
    document.getElementById('item-form').addEventListener('submit', handleFormSubmit);

    // Filtres
    setupFilters();

    // Fermeture du modal
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    });
}

function setupFilters() {
    const filterSelectors = [
        'pokemon-items-status-filter', 'pokemon-items-lang-filter',
        'pokemon-cards-status-filter', 'pokemon-cards-type-filter',
        'pokemon-graded-org-filter', 'pokemon-graded-grade-filter',
        'onepiece-items-status-filter', 'onepiece-items-lang-filter',
        'onepiece-graded-org-filter', 'onepiece-graded-grade-filter'
    ];

    filterSelectors.forEach(selector => {
        const element = document.getElementById(selector);
        if (element) {
            element.addEventListener('change', () => {
                const category = selector.split('-')[0] + '-' + selector.split('-')[1];
                filterTable(category);
            });
        }
    });
}

// Navigation entre les onglets
function switchTab(tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Désactiver tous les boutons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Activer l'onglet et le bouton sélectionnés
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Mettre à jour les données affichées seulement si ce n'est pas le dashboard
    if (tabName !== 'dashboard') {
        updateTable(tabName);
    }
}

// Gestion des données
function loadData() {
    const savedData = localStorage.getItem('granddex-data');
    if (savedData) {
        currentData = JSON.parse(savedData);
    }
}

function saveData() {
    localStorage.setItem('granddex-data', JSON.stringify(currentData));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Gestion du modal
function openModal(category, itemId = null) {
    currentCategory = category;
    currentEditingId = itemId;
    
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('item-form');
    
    // Réinitialiser le formulaire
    form.reset();
    
    // Configurer les options de type et d'état
    setupTypeOptions(category);
    setupEtatOptions(category);
    
    // Afficher/masquer les champs pour les cartes gradées
    const gradedFields = document.querySelectorAll('.graded-only');
    const isGraded = category.includes('graded');
    gradedFields.forEach(field => {
        field.style.display = isGraded ? 'flex' : 'none';
    });
    
    // Remplir le formulaire si on édite
    if (itemId) {
        title.textContent = 'Modifier un élément';
        const item = currentData[category].find(item => item.id === itemId);
        if (item) {
            fillFormWithData(item);
        }
    } else {
        title.textContent = 'Ajouter un élément';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    currentEditingId = null;
    currentCategory = null;
}

function setupTypeOptions(category) {
    const typeSelect = document.getElementById('type');
    typeSelect.innerHTML = '';
    
    TYPE_CONFIG[category].forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}

function setupEtatOptions(category) {
    const etatSelect = document.getElementById('etat');
    etatSelect.innerHTML = '';
    
    ETAT_CONFIG[category].forEach(etat => {
        const option = document.createElement('option');
        option.value = etat;
        option.textContent = etat;
        etatSelect.appendChild(option);
    });
}

function fillFormWithData(item) {
    document.getElementById('status').value = item.status;
    document.getElementById('bloc').value = item.bloc;
    document.getElementById('nom').value = item.nom;
    document.getElementById('type').value = item.type;
    document.getElementById('prix-achat').value = item.prixAchat;
    document.getElementById('prix-vente').value = item.prixVente || '';
    document.getElementById('etat').value = item.etat;
    document.getElementById('langue').value = item.langue;
    document.getElementById('note').value = item.note || '';
    
    if (item.organisme) {
        document.getElementById('organisme').value = item.organisme;
    }
    if (item.cotation) {
        document.getElementById('cotation').value = item.cotation;
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: currentEditingId || generateId(),
        status: document.getElementById('status').value,
        bloc: document.getElementById('bloc').value,
        nom: document.getElementById('nom').value,
        type: document.getElementById('type').value,
        prixAchat: parseFloat(document.getElementById('prix-achat').value),
        prixVente: document.getElementById('prix-vente').value ? parseFloat(document.getElementById('prix-vente').value) : null,
        etat: document.getElementById('etat').value,
        langue: document.getElementById('langue').value,
        note: document.getElementById('note').value
    };
    
    // Ajouter les champs spécifiques aux cartes gradées
    if (currentCategory.includes('graded')) {
        formData.organisme = document.getElementById('organisme').value;
        formData.cotation = document.getElementById('cotation').value;
    }
    
    // Calculer la différence
    formData.difference = formData.prixVente ? formData.prixVente - formData.prixAchat : null;
    
    if (currentEditingId) {
        // Modifier l'élément existant
        const index = currentData[currentCategory].findIndex(item => item.id === currentEditingId);
        if (index !== -1) {
            currentData[currentCategory][index] = formData;
        }
    } else {
        // Ajouter un nouvel élément
        currentData[currentCategory].push(formData);
    }
    
    saveData();
    updateTable(currentCategory);
    updateDashboard();
    closeModal();
}

// Mise à jour des tableaux
function updateTable(category) {
    const tableBody = document.querySelector(`#${category}-table tbody`);
    if (!tableBody) return; // Protection contre les erreurs
    
    const data = currentData[category];
    
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = createTableRow(item, category);
        tableBody.appendChild(row);
    });
    
    updateTableTotals(category);
}

function createTableRow(item, category) {
    const row = document.createElement('tr');
    
    const cells = [
        `<span class="status-${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span>`,
        item.bloc,
        item.nom,
        item.type,
        `€${item.prixAchat.toFixed(2)}`,
        item.prixVente ? `€${item.prixVente.toFixed(2)}` : '-',
        item.difference !== null ? `<span class="difference-${item.difference >= 0 ? 'positive' : 'negative'}">€${item.difference.toFixed(2)}</span>` : '-',
        item.etat,
        item.langue,
        item.note || '-'
    ];
    
    // Ajouter les colonnes spécifiques aux cartes gradées
    if (category.includes('graded')) {
        cells.splice(4, 0, item.organisme || '-', item.cotation || '-');
    }
    
    // Supprimer les colonnes de dates (les colonnes 7 et 8 après l'ajout des colonnes gradées)
    if (category.includes('graded')) {
        // Pour les cartes gradées, les dates seraient aux positions 9 et 10
        // Mais comme on ne les affiche plus, on n'a rien à supprimer
    } else {
        // Pour les autres catégories, les dates seraient aux positions 7 et 8
        // Mais comme on ne les affiche plus, on n'a rien à supprimer
    }
    
    // Ajouter les boutons d'action
    cells.push(`
        <div>
            <button class="action-btn edit" onclick="editItem('${category}', '${item.id}')" title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" onclick="deleteItem('${category}', '${item.id}')" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `);
    
    cells.forEach(cell => {
        const td = document.createElement('td');
        td.innerHTML = cell;
        row.appendChild(td);
    });
    
    return row;
}

function updateTableTotals(category) {
    const data = currentData[category];
    const totalAchat = data.reduce((sum, item) => sum + item.prixAchat, 0);
    const totalVente = data.reduce((sum, item) => sum + (item.prixVente || 0), 0);
    const benefice = totalVente - totalAchat;
    
    const totalAchatEl = document.getElementById(`${category}-total-achat`);
    const totalVenteEl = document.getElementById(`${category}-total-vente`);
    const beneficeEl = document.getElementById(`${category}-benefice`);
    
    if (totalAchatEl) totalAchatEl.textContent = `€${totalAchat.toFixed(2)}`;
    if (totalVenteEl) totalVenteEl.textContent = `€${totalVente.toFixed(2)}`;
    if (beneficeEl) beneficeEl.textContent = `€${benefice.toFixed(2)}`;
}

function filterTable(category) {
    const data = currentData[category];
    const statusFilter = document.getElementById(`${category}-status-filter`)?.value;
    const langFilter = document.getElementById(`${category}-lang-filter`)?.value;
    const typeFilter = document.getElementById(`${category}-type-filter`)?.value;
    const orgFilter = document.getElementById(`${category}-org-filter`)?.value;
    const gradeFilter = document.getElementById(`${category}-grade-filter`)?.value;
    
    let filteredData = data.filter(item => {
        if (statusFilter && item.status !== statusFilter) return false;
        if (langFilter && item.langue !== langFilter) return false;
        if (typeFilter && item.type !== typeFilter) return false;
        if (orgFilter && item.organisme !== orgFilter) return false;
        if (gradeFilter && item.cotation !== gradeFilter) return false;
        return true;
    });
    
    const tableBody = document.querySelector(`#${category}-table tbody`);
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    filteredData.forEach(item => {
        const row = createTableRow(item, category);
        tableBody.appendChild(row);
    });
}

// Actions sur les éléments
function editItem(category, itemId) {
    openModal(category, itemId);
}

function deleteItem(category, itemId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
        currentData[category] = currentData[category].filter(item => item.id !== itemId);
        saveData();
        updateTable(category);
        updateDashboard();
    }
}

// Tableau de bord
function updateDashboard() {
    const stats = calculateGlobalStats();
    
    const totalValueEl = document.getElementById('total-value');
    const totalProfitEl = document.getElementById('total-profit');
    const totalItemsEl = document.getElementById('total-items');
    const totalCardsEl = document.getElementById('total-cards');
    
    if (totalValueEl) totalValueEl.textContent = `€${stats.totalValue.toFixed(2)}`;
    if (totalProfitEl) totalProfitEl.textContent = `€${stats.totalProfit.toFixed(2)}`;
    if (totalItemsEl) totalItemsEl.textContent = stats.totalItems;
    if (totalCardsEl) totalCardsEl.textContent = stats.totalCards;
    
    updateCharts(stats);
}

function calculateGlobalStats() {
    const stats = {
        totalValue: 0,
        totalProfit: 0,
        totalItems: 0,
        totalCards: 0,
        categoryData: {
            'Items Pokémon': 0,
            'Cartes Pokémon': 0,
            'Cartes Gradées Pokémon': 0,
            'Items One Piece': 0,
            'Cartes Gradées One Piece': 0
        }
    };
    
    Object.keys(currentData).forEach(category => {
        const data = currentData[category];
        const categoryValue = data.reduce((sum, item) => sum + item.prixAchat, 0);
        const categoryProfit = data.reduce((sum, item) => sum + (item.difference || 0), 0);
        
        stats.totalValue += categoryValue;
        stats.totalProfit += categoryProfit;
        
        if (category.includes('items')) {
            stats.totalItems += data.length;
        } else {
            stats.totalCards += data.length;
        }
        
        // Données pour les graphiques
        const categoryName = getCategoryDisplayName(category);
        stats.categoryData[categoryName] = categoryValue;
        

    });
    
    return stats;
}

function getCategoryDisplayName(category) {
    const names = {
        'pokemon-items': 'Items Pokémon',
        'pokemon-cards': 'Cartes Pokémon',
        'pokemon-graded': 'Cartes Gradées Pokémon',
        'onepiece-items': 'Items One Piece',
        'onepiece-graded': 'Cartes Gradées One Piece'
    };
    return names[category] || category;
}

// Graphiques
function setupCharts() {
    const categoryCtx = document.getElementById('categoryChart');
    
    if (!categoryCtx) return;
    
    // Graphique en camembert pour les catégories
    window.categoryChart = new Chart(categoryCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#ff6b6b', '#4ecdc4', '#45b7d1', '#ff9f43', '#5f27cd'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
    

}

function updateCharts(stats) {
    if (!window.categoryChart) return;
    
    // Mettre à jour le graphique des catégories
    const categoryLabels = Object.keys(stats.categoryData).filter(key => stats.categoryData[key] > 0);
    const categoryValues = categoryLabels.map(key => stats.categoryData[key]);
    
    window.categoryChart.data.labels = categoryLabels;
    window.categoryChart.data.datasets[0].data = categoryValues;
    window.categoryChart.update();
}

// Utilitaires


// Export/Import des données
function exportData() {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `granddex-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    currentData = importedData;
                    saveData();
                    updateDashboard();
                    const activeTab = document.querySelector('.tab-content.active');
                    if (activeTab && activeTab.id !== 'dashboard') {
                        updateTable(activeTab.id);
                    }
                    alert('Données importées avec succès !');
                } catch (error) {
                    alert('Erreur lors de l\'import des données : ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Ajouter les fonctions d'export/import au scope global
window.exportData = exportData;
window.importData = importData;
