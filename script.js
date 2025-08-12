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
        'AR', 'FA', 'ALT', 'V', 'VMAX', 'VSTAR', 'GOLD', 'GX', 'Promo', 'EX', 'Shiny', 'Ace', 'Turbo'
    ],
    'pokemon-graded': [
        'AR', 'FA', 'ALT', 'V', 'VMAX', 'VSTAR', 'GOLD', 'GX', 'Promo', 'EX', 'Shiny', 'Ace', 'Turbo'
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
    setupPinGate();
    loadData();
    setupEventListeners();
    setupCharts();
    updateDashboard();
}

function setupPinGate() {
    const PIN_STORAGE_KEY = 'granddex-pin';
    const ACCESS_KEY = 'granddex-access-granted';
    const overlay = document.getElementById('pin-gate');
    const input = document.getElementById('pin-input');
    const submit = document.getElementById('pin-submit');
    const error = document.getElementById('pin-error');

    if (!overlay || !input || !submit) return;

    // Si déjà validé dans cette session, ne pas bloquer et initialiser la sync
    if (sessionStorage.getItem(ACCESS_KEY) === '1') {
        overlay.style.display = 'none';
        initCloudSync();
        return;
    }

    // Si aucun PIN défini, demander d'en créer un d'abord
    let savedPin = localStorage.getItem(PIN_STORAGE_KEY);
    if (!savedPin) {
        // Premier lancement: l'utilisateur crée son code
        overlay.querySelector('h2').textContent = 'Créer votre code';
        overlay.querySelector('.subtitle').textContent = 'Choisissez un code à 6 chiffres';
    }

    function tryValidate() {
        const value = (input.value || '').trim();
        if (!/^\d{6}$/.test(value)) {
            error.textContent = 'Entrez 6 chiffres';
            error.style.display = 'block';
            return;
        }
        if (!savedPin) {
            // on enregistre le nouveau PIN
            localStorage.setItem(PIN_STORAGE_KEY, value);
            savedPin = value;
            sessionStorage.setItem(ACCESS_KEY, '1');
            overlay.style.display = 'none';
            initCloudSync();
            return;
        }
        if (value === savedPin) {
            sessionStorage.setItem(ACCESS_KEY, '1');
            overlay.style.display = 'none';
            initCloudSync();
        } else {
            error.textContent = 'Code incorrect';
            error.style.display = 'block';
            input.select();
        }
    }

    submit.addEventListener('click', tryValidate);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            tryValidate();
        }
    });
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
    
    // Fermeture de la modal de suppression
    document.getElementById('delete-modal').addEventListener('click', (e) => {
        if (e.target.id === 'delete-modal') {
            closeDeleteModal();
        }
    });
    
    // Fermeture de la modal d'import
    document.getElementById('import-modal').addEventListener('click', (e) => {
        if (e.target.id === 'import-modal') {
            closeImportModal();
        }
    });
    
    // Mise à jour du texte du bouton selon la quantité
    document.getElementById('quantite').addEventListener('input', updateSubmitButtonText);
    
    // Initialiser le tri des colonnes
    setupTableSorting();
}

// Debounce sauvegarde cloud
let cloudSaveTimer = null;
function scheduleCloudSave() {
    if (!window.firebaseCloud?.saveCloud) return; // si firebase non dispo, ignorer
    // Sauvegarde uniquement quand la session est authentifiée par PIN
    if (!isAuthenticatedSession()) return;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(async () => {
        try {
            const deviceId = window.firebaseCloud.getDeviceId();
            await window.firebaseCloud.saveCloud(deviceId, currentData);
            console.debug('Sauvegarde cloud effectuée');
        } catch (e) {
            console.warn('Sauvegarde cloud échouée:', e.message);
        }
    }, 800);
}

function isAuthenticatedSession() {
    try {
        const hasPin = !!localStorage.getItem('granddex-pin');
        const granted = sessionStorage.getItem('granddex-access-granted') === '1';
        return hasPin && granted;
    } catch (_) {
        return false;
    }
}

function initCloudSync() {
    autoLoadFromCloud();
    startRealtimeSync();
}

async function autoLoadFromCloud() {
    try {
        if (!isAuthenticatedSession()) return;
        if (!window.firebaseCloud?.loadCloud) return;
        const deviceId = window.firebaseCloud.getDeviceId();
        const cloudData = await window.firebaseCloud.loadCloud(deviceId);
        if (cloudData && typeof cloudData === 'object') {
            currentData = cloudData;
            localStorage.setItem('granddex-data', JSON.stringify(currentData));
            updateDashboard();
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab && activeTab.id !== 'dashboard') {
                updateTable(activeTab.id);
            }
            console.debug('Données cloud chargées au démarrage');
        }
    } catch (e) {
        console.warn('Chargement cloud au démarrage échoué:', e.message);
    }
}

// Sync temps réel depuis Firestore vers l'app (et UI)
function startRealtimeSync() {
    try {
        if (!isAuthenticatedSession()) return;
        if (!window.firebaseCloud?.subscribeCloud) return;
        const deviceId = window.firebaseCloud.getDeviceId();
        window.__granddex_unsub && window.__granddex_unsub();
        window.__granddex_unsub = window.firebaseCloud.subscribeCloud(deviceId, (cloudData) => {
            if (!cloudData) return;
            const localStr = localStorage.getItem('granddex-data');
            const localData = localStr ? JSON.parse(localStr) : null;
            const remoteStr = JSON.stringify(cloudData);
            const localStrCanon = JSON.stringify(localData);
            if (remoteStr === localStrCanon) return;
            currentData = cloudData;
            localStorage.setItem('granddex-data', remoteStr);
            updateDashboard();
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab && activeTab.id !== 'dashboard') {
                updateTable(activeTab.id);
            }
            console.debug('Mise à jour en temps réel reçue.');
        });
    } catch (e) {
        console.warn('Activation du temps réel échouée:', e.message);
    }
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
    
    // Ajouter les event listeners pour les barres de recherche
    const searchSelectors = [
        'search-pokemon-items',
        'search-pokemon-cards', 
        'search-pokemon-graded',
        'search-onepiece-items',
        'search-onepiece-graded'
    ];
    
    searchSelectors.forEach(selector => {
        const element = document.getElementById(selector);
        if (element) {
            element.addEventListener('input', () => {
                const category = selector.replace('search-', '');
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
    scheduleCloudSave();
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
    const submitText = document.getElementById('submit-text');
    const quantiteInput = document.getElementById('quantite');
    
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
        submitText.textContent = 'Modifier';
        quantiteInput.style.display = 'none';
        const item = currentData[category].find(item => item.id === itemId);
        if (item) {
            fillFormWithData(item);
        }
    } else {
        title.textContent = 'Ajouter un élément';
        submitText.textContent = 'Enregistrer';
        quantiteInput.style.display = 'block';
        quantiteInput.value = '1';
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
    
    const quantite = parseInt(document.getElementById('quantite').value) || 1;
    
    if (currentEditingId) {
        // Modifier l'élément existant (pas de création en lot)
        const formData = createFormData();
        const index = currentData[currentCategory].findIndex(item => item.id === currentEditingId);
        if (index !== -1) {
            currentData[currentCategory][index] = formData;
        }
        saveData();
        updateTable(currentCategory);
        updateDashboard();
        closeModal();
    } else {
        // Création en lot
        if (quantite === 1) {
            // Créer une seule entrée
            const formData = createFormData();
            currentData[currentCategory].push(formData);
            saveData();
            updateTable(currentCategory);
            updateDashboard();
            closeModal();
        } else {
            // Créer plusieurs entrées
            createMultipleItems(quantite);
        }
    }
}

function createFormData() {
    const formData = {
        id: generateId(),
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
    
    return formData;
}

function createMultipleItems(quantite) {
    const items = [];
    
    for (let i = 0; i < quantite; i++) {
        const formData = createFormData();
        items.push(formData);
    }
    
    // Ajouter tous les éléments
    currentData[currentCategory].push(...items);
    
    // Sauvegarder et mettre à jour
    saveData();
    updateTable(currentCategory);
    updateDashboard();
    
    // Afficher un message de confirmation
    showSuccessMessage(`${quantite} entrées créées avec succès !`);
    
    closeModal();
}

function showSuccessMessage(message) {
    // Créer un toast de succès
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Afficher le toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Le masquer après 3 secondes
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Fonctions de tri des colonnes
function setupTableSorting() {
    // Ajouter les event listeners pour tous les en-têtes triables
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => handleColumnSort(th));
    });
}

function handleColumnSort(headerElement) {
    const column = headerElement.dataset.sort;
    const table = headerElement.closest('table');
    const category = getCategoryFromTable(table);
    
    if (!category) return;
    
    // Déterminer la direction du tri
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    // Mettre à jour l'apparence des en-têtes
    updateSortHeaders(headerElement);
    
    // Trier les données
    sortTableData(category, column, currentSortDirection);
    
    // Mettre à jour l'affichage
    updateTable(category);
}

function updateSortHeaders(activeHeader) {
    // Réinitialiser tous les en-têtes
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('active', 'asc', 'desc');
    });
    
    // Marquer l'en-tête actif
    activeHeader.classList.add('active');
    activeHeader.classList.add(currentSortDirection);
}

function sortTableData(category, column, direction) {
    const data = currentData[category];
    
    data.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        // Gérer les valeurs null/undefined
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        // Détecter si c'est un nombre
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        const isNumeric = !isNaN(aNum) && !isNaN(bNum);
        
        let comparison = 0;
        
        if (isNumeric) {
            // Tri numérique
            comparison = aNum - bNum;
        } else {
            // Tri alphabétique
            comparison = String(aValue).localeCompare(String(bValue), 'fr', { numeric: true });
        }
        
        // Appliquer la direction du tri
        return direction === 'asc' ? comparison : -comparison;
    });
}

function getCategoryFromTable(table) {
    const tableId = table.id;
    if (tableId.includes('pokemon-items')) return 'pokemon-items';
    if (tableId.includes('pokemon-cards')) return 'pokemon-cards';
    if (tableId.includes('pokemon-graded')) return 'pokemon-graded';
    if (tableId.includes('onepiece-items')) return 'onepiece-items';
    if (tableId.includes('onepiece-graded')) return 'onepiece-graded';
    return null;
}

// Variables pour l'import
let importCategory = null;
let parsedImportData = null;

// Fonctions d'import Google Sheets
function openImportModal(category) {
    importCategory = category;
    document.getElementById('import-modal').style.display = 'block';
    document.getElementById('import-data').value = '';
    document.getElementById('preview-table').innerHTML = '';
    document.getElementById('execute-import-btn').disabled = true;
    parsedImportData = null;
}

function closeImportModal() {
    document.getElementById('import-modal').style.display = 'none';
    importCategory = null;
    parsedImportData = null;
}

function previewImport() {
    const data = document.getElementById('import-data').value.trim();
    const separator = document.getElementById('import-separator').value;
    
    if (!data) {
        showErrorMessage('Veuillez entrer des données à importer');
        return;
    }
    
    try {
        const parsed = parseImportData(data, separator, importCategory);
        if (parsed && parsed.length > 0) {
            parsedImportData = parsed;
            showImportPreview(parsed, importCategory);
            document.getElementById('execute-import-btn').disabled = false;
        } else {
            showErrorMessage('Aucune donnée valide trouvée. Vérifiez le format et le séparateur.');
        }
    } catch (error) {
        showErrorMessage('Erreur lors du parsing des données: ' + error.message);
    }
}

function parseImportData(data, separator, category) {
    const lines = data.split('\n').filter(line => line.trim());
    const separatorChar = getSeparatorChar(separator);
    
    return lines.map((line, index) => {
        const columns = line.split(separatorChar).map(col => col.trim());
        
        switch (category) {
            case 'pokemon-items':
                return parsePokemonItem(columns, index);
            case 'pokemon-cards':
                return parsePokemonCard(columns, index);
            case 'pokemon-graded':
            case 'onepiece-graded':
                return parseGradedCard(columns, index);
            case 'onepiece-items':
                return parseOnePieceItem(columns, index);
            default:
                throw new Error('Catégorie non reconnue');
        }
    });
}

function getSeparatorChar(separator) {
    switch (separator) {
        case 'tab': return '\t';
        case 'comma': return ',';
        case 'semicolon': return ';';
        default: return '\t';
    }
}

function parsePokemonItem(columns, index) {
    if (columns.length < 9) {
        throw new Error(`Ligne ${index + 1}: Format invalide. Attendu: Status | Bloc | Type | Nom | Prix Achat | Prix Vente | Différence | État | Langue`);
    }
    
    return {
        status: columns[0] || 'En stock',
        bloc: columns[1] || '',
        type: columns[2] || '',
        nom: columns[3] || '',
        prixAchat: parseFloat(columns[4]?.replace('€', '').replace(',', '.')) || 0,
        prixVente: columns[5] ? parseFloat(columns[5].replace('€', '').replace(',', '.')) : null,
        difference: columns[6] ? parseFloat(columns[6].replace('€', '').replace(',', '.')) : null,
        etat: columns[7] || 'Scellé',
        langue: columns[8] || 'FR'
    };
}

function parsePokemonCard(columns, index) {
    if (columns.length < 9) {
        throw new Error(`Ligne ${index + 1}: Format invalide. Attendu: Langue | Status | Bloc | Nom | Type | Prix Achat | Prix Vente | Différence | État`);
    }
    
    return {
        langue: columns[0] || 'FR',
        status: columns[1] || 'En stock',
        bloc: columns[2] || '',
        nom: columns[3] || '',
        type: columns[4] || '',
        prixAchat: parseFloat(columns[5]?.replace('€', '').replace(',', '.')) || 0,
        prixVente: columns[6] ? parseFloat(columns[6].replace('€', '').replace(',', '.')) : null,
        difference: columns[7] ? parseFloat(columns[7].replace('€', '').replace(',', '.')) : null,
        etat: columns[8] || 'Mint'
    };
}

function parseGradedCard(columns, index) {
    if (columns.length < 11) {
        throw new Error(`Ligne ${index + 1}: Format invalide. Attendu: Status | Nom | Organisme | Cotation | Type | Prix Achat | Prix Vente | Différence | État | Note | Langue`);
    }
    
    return {
        status: columns[0] || 'En stock',
        nom: columns[1] || '',
        organisme: columns[2] || '',
        cotation: columns[3] || '',
        type: columns[4] || '',
        prixAchat: parseFloat(columns[5]?.replace('€', '').replace(',', '.')) || 0,
        prixVente: columns[6] ? parseFloat(columns[6].replace('€', '').replace(',', '.')) : null,
        difference: columns[7] ? parseFloat(columns[7].replace('€', '').replace(',', '.')) : null,
        etat: columns[8] || 'Mint',
        note: columns[9] || '',
        langue: columns[10] || 'FR'
    };
}

function parseOnePieceItem(columns, index) {
    // Même format que les items Pokémon
    return parsePokemonItem(columns, index);
}

function showImportPreview(data, category) {
    const previewContainer = document.getElementById('preview-table');
    const headers = getHeadersForCategory(category);
    
    let html = '<table class="preview-table"><thead><tr>';
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    data.slice(0, 5).forEach(item => { // Afficher seulement les 5 premières lignes
        html += '<tr>';
        Object.values(item).forEach(value => {
            html += `<td>${value || '-'}</td>`;
        });
        html += '</tr>';
    });
    
    if (data.length > 5) {
        html += `<tr><td colspan="${headers.length}" style="text-align: center; color: var(--text-secondary);">... et ${data.length - 5} autres lignes</td></tr>`;
    }
    
    html += '</tbody></table>';
    previewContainer.innerHTML = html;
}

function getHeadersForCategory(category) {
    switch (category) {
        case 'pokemon-items':
        case 'onepiece-items':
            return ['Status', 'Bloc', 'Type', 'Nom', 'Prix Achat', 'Prix Vente', 'Différence', 'État', 'Langue'];
        case 'pokemon-cards':
            return ['Langue', 'Status', 'Bloc', 'Nom', 'Type', 'Prix Achat', 'Prix Vente', 'Différence', 'État'];
        case 'pokemon-graded':
        case 'onepiece-graded':
            return ['Status', 'Nom', 'Organisme', 'Cotation', 'Type', 'Prix Achat', 'Prix Vente', 'Différence', 'État', 'Note', 'Langue'];
        default:
            return [];
    }
}

function executeImport() {
    if (!parsedImportData || !importCategory) {
        showErrorMessage('Aucune donnée à importer');
        return;
    }
    
    try {
        // Ajouter les données importées
        parsedImportData.forEach(item => {
            item.id = generateId();
            item.note = item.note || '';
            
            // Calculer la différence si elle n'est pas fournie
            if (item.difference === null && item.prixVente !== null) {
                item.difference = item.prixVente - item.prixAchat;
            }
            
            currentData[importCategory].push(item);
        });
        
        // Sauvegarder et mettre à jour
        saveData();
        updateTable(importCategory);
        updateDashboard();
        
        // Afficher le message de succès
        showSuccessMessage(`${parsedImportData.length} éléments importés avec succès !`);
        
        // Fermer la modal
        closeImportModal();
        
    } catch (error) {
        showErrorMessage('Erreur lors de l\'import: ' + error.message);
    }
}

function showErrorMessage(message) {
    // Créer un toast d'erreur
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Afficher le toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Le masquer après 4 secondes
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
}

function updateSubmitButtonText() {
    const quantite = parseInt(document.getElementById('quantite').value) || 1;
    const submitText = document.getElementById('submit-text');
    
    if (quantite === 1) {
        submitText.textContent = 'Enregistrer';
    } else {
        submitText.textContent = `Créer ${quantite} entrées`;
    }
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
    const searchFilter = document.getElementById(`search-${category}`)?.value?.toLowerCase();
    
    let filteredData = data.filter(item => {
        if (statusFilter && item.status !== statusFilter) return false;
        if (langFilter && item.langue !== langFilter) return false;
        if (typeFilter && item.type !== typeFilter) return false;
        if (orgFilter && item.organisme !== orgFilter) return false;
        if (gradeFilter && item.cotation !== gradeFilter) return false;
        
        // Filtre par recherche textuelle
        if (searchFilter) {
            const searchableText = [
                item.status,
                item.bloc,
                item.nom,
                item.type,
                item.etat,
                item.langue,
                item.note,
                item.organisme,
                item.cotation
            ].filter(Boolean).join(' ').toLowerCase();
            
            if (!searchableText.includes(searchFilter)) return false;
        }
        
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

// Variables pour la suppression
let itemToDelete = null;

// Variables pour le tri
let currentSortColumn = null;
let currentSortDirection = 'asc';

// Actions sur les éléments
function editItem(category, itemId) {
    openModal(category, itemId);
}

function deleteItem(category, itemId) {
    const item = currentData[category].find(item => item.id === itemId);
    if (!item) return;
    
    itemToDelete = { category, itemId };
    
    // Afficher les détails de l'élément à supprimer
    document.getElementById('delete-item-name').textContent = item.nom;
    document.getElementById('delete-item-category').textContent = getCategoryDisplayName(category);
    
    // Ouvrir la modal de confirmation
    document.getElementById('delete-modal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    itemToDelete = null;
}

function confirmDelete() {
    if (!itemToDelete) return;
    
    const { category, itemId } = itemToDelete;
    currentData[category] = currentData[category].filter(item => item.id !== itemId);
    saveData();
    updateTable(category);
    updateDashboard();
    
    closeDeleteModal();
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
