# GrandDex - Gestionnaire d'Inventaire Pokémon & One Piece

Une application web moderne avec interface glassmorphisme pour gérer votre collection de cartes Pokémon et One Piece.

## 🚀 Fonctionnalités

### 📊 Tableau de bord
- Vue d'ensemble avec statistiques globales
- Graphiques de répartition par catégorie
- Suivi des bénéfices mensuels
- Totaux automatiques

### 📦 Gestion des inventaires
- **Items Pokémon** : Booster, ETB, Display, etc.
- **Cartes Pokémon** : Cartes loose non gradées
- **Cartes Gradées Pokémon** : Cartes avec cotation PSA, BGS, etc.
- **Items One Piece** : Booster, ETB, Display, etc.
- **Cartes Gradées One Piece** : Cartes avec cotation

### 🔧 Fonctionnalités avancées
- Ajout, modification et suppression d'éléments
- Filtres dynamiques par statut, langue, type, etc.
- Calcul automatique des bénéfices/pertes
- Sauvegarde locale des données
- Interface responsive (PC et mobile)
- Design glassmorphisme moderne

## 🎨 Design

- **Style Glassmorphisme** : Effet de verre dépoli avec transparence
- **Couleurs thématiques** : Inspirées de Pokémon et One Piece
- **Animations fluides** : Transitions et effets visuels
- **Responsive** : Adapté à tous les écrans

## 🛠️ Installation et utilisation

### Prérequis
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Serveur web local (optionnel)

### Démarrage rapide

1. **Avec le serveur Python inclus** :
   ```bash
   python server.py
   ```
   Puis ouvrez http://localhost:1111

2. **Sans serveur** :
   Ouvrez simplement le fichier `index.html` dans votre navigateur

### Import de données d'exemple

Pour tester l'application avec des données d'exemple :

1. Ouvrez la console du navigateur (F12)
2. Exécutez : `importData()`
3. Sélectionnez le fichier `data-example.json`

## 📱 Utilisation

### Navigation
- Utilisez les onglets en haut pour naviguer entre les différentes sections
- Le tableau de bord affiche les statistiques globales

### Ajouter un élément
1. Cliquez sur le bouton "Ajouter" dans l'onglet souhaité
2. Remplissez le formulaire
3. Cliquez sur "Enregistrer"

### Modifier/Supprimer
- Cliquez sur l'icône crayon pour modifier
- Cliquez sur l'icône poubelle pour supprimer

### Filtres
- Utilisez les filtres en haut de chaque tableau pour affiner les résultats
- Les totaux se mettent à jour automatiquement

## 💾 Sauvegarde des données

Les données sont automatiquement sauvegardées dans le localStorage du navigateur.

### Export/Import
- **Export** : `exportData()` dans la console
- **Import** : `importData()` dans la console

## 🎯 Structure des données

Chaque élément contient :
- **Status** : En stock, Mis en vente, Vendu
- **Bloc** : Nom de la série (ex: "Écarlate et Violet", "OP-01")
- **Nom** : Nom de l'article ou de la carte
- **Type** : Type de produit (Booster, AR, VMAX, etc.)
- **Prix d'achat/vente** : Montants en euros
- **Dates** : Dates d'achat et de vente
- **État** : État de conservation
- **Langue** : FR, EN, JAP
- **Note** : Commentaires libres

### Cartes gradées (supplémentaire)
- **Organisme** : PSA, BGS, CGC, SGC
- **Cotation** : 10, 9.5, 9, 8.5, 8

## 🔧 Personnalisation

### Modifier les types disponibles
Éditez le fichier `script.js` et modifiez les constantes :
- `TYPE_CONFIG` : Types de produits par catégorie
- `ETAT_CONFIG` : États de conservation par catégorie

### Modifier les couleurs
Éditez le fichier `styles.css` et modifiez les variables CSS dans `:root`

## 📋 Compatibilité

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 🐛 Dépannage

### Problèmes courants
1. **Les données ne se sauvegardent pas** : Vérifiez que le localStorage est activé
2. **Les graphiques ne s'affichent pas** : Vérifiez la connexion internet (Chart.js CDN)
3. **Interface déformée** : Vérifiez la taille de la fenêtre (responsive)

### Support
Pour toute question ou problème, vérifiez :
- La console du navigateur (F12) pour les erreurs
- La compatibilité du navigateur
- L'activation du JavaScript

## 📄 Licence

Ce projet est open source et libre d'utilisation.

---

**GrandDex** - Gestionnez votre collection comme un pro ! 🎴✨
