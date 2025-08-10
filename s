
> Crée un site web/app nommé **GrandDex** avec une interface moderne et responsive.
> Le site comporte **plusieurs onglets** pour gérer un inventaire d’objets et cartes Pokémon et One Piece, avec possibilité de filtrer, trier, ajouter, modifier et supprimer les entrées.
> Affiche des **totaux**, **bénéfices/pertes**, et **graphiques** de suivi.
>
> ### **Onglets :**
>
> 1. **Tableau de bord**
>
>    * Vue globale avec graphiques (barres, camemberts…) montrant :
>
>      * Valeur totale actuelle du stock par catégorie :
>
>        * Items One Piece
>        * Items Pokémon
>        * Cartes Pokémon
>        * Cartes One Piece
>      * Totaux prix d’achat, prix de vente, bénéfices/pertes
>    * Graphiques comparatifs selon les catégories
>
> ---
>
> 2. **Stock Items Pokémon**
>    Colonnes :
>
>    * **Status** : dropdown ("En stock", "Mis en vente", "Vendu")
>    * **Bloc** : texte libre (ex: "EB", "XY", "Soleil et Lune", ou jap: "sv2a", "sv4m"…)
>    * **Nom de l'article** (ex: "Aventures ensemble", "Coffret Nabil", "Flammes blanches"…)
>    * **Type** : dropdown ("Display", "ETB", "Booster", "Mini Tin", "Display Mini Tins", "Coffret"…)
>    * **Prix d'achat** (numérique)
>    * **Prix de vente** (numérique)
>    * **Date d'achat** (sélecteur calendrier)
>    * **Date de vente** (sélecteur calendrier)
>    * **Différence** (calcul automatique = vente - achat)
>    * **État** : dropdown ("Scellé", "Non scellé", "Nevermint", "En loose", "Défaut")
>    * **Langue** : dropdown ("FR", "EN", "JAP")
>    * **Note** (texte libre pour défauts, ex: scellage endommagé)
>    * **Totaux** affichés en bas du tableau (achat, vente, bénéfice/perte)
>    * **Filtres dynamiques** : dropdown avec cases à cocher pour afficher/masquer certains statuts ou langues
>
> ---
>
> 3. **Stock Cartes Pokémon non gradées (Loose)**
>    Colonnes :
>
>    * **Status** : dropdown ("En stock", "Mis en vente", "Vendu")
>    * **Bloc** (ex: "EB", "XY", "Soleil et Lune", "sv2a"…)
>    * **Nom** (ex: "Machoc", "Tartare", "Exagide"…)
>    * **Type** : dropdown ("AR", "FA", "ALT", "V", "VMAX", "VSTAR", "GOLD", "GX", "Promo", "EX", "Shiny"…)
>    * **Prix d'achat**
>    * **Prix de vente**
>    * **Date d'achat**
>    * **Date de vente**
>    * **Différence** (calcul automatique)
>    * **État** : texte ("Mint", "Near Mint", "Excellent", "Good", "Semi Good", "Bad", "Very Bad")
>    * **Langue** : dropdown ("FR", "EN", "JAP")
>    * **Note** (défaut visuel : point blanc, pli…)
>    * **Totaux** + filtres dynamiques (comme l’onglet précédent)
>
> ---
>
> 4. **Stock Cartes Pokémon gradées**
>    Même structure que l’onglet précédent, mais avec **champs supplémentaires** :
>
>    * **Organisme** : dropdown ("CA", "PSA", "PCA", "SFG"…)
>    * **Cotation** : dropdown ("10+", "10", "9.5", "9", "8.5", "8"…) avec lien visuel vers l’état de la carte
>
> ---
>
> 5. **Stock Items One Piece**
>    Identique à **Stock Items Pokémon**, mais pour les produits One Piece.
>
> ---
>
> 6. **Stock Cartes One Piece gradées**
>    Identique à **Stock Cartes Pokémon gradées**, mais pour les cartes One Piece.
>
> ---
>
> ### **Fonctionnalités générales** :
>
> * Saisie, édition et suppression rapide des données
> * Filtres par statut, langue, type…
> * Totaux automatiques par tableau
> * Calcul automatique des bénéfices/pertes
> * Graphiques pour visualiser les tendances
> * Interface claire, responsive et agréable à utiliser
> * Sauvegarde des données localement ou dans une base de données
>
> Palette visuelle : moderne, avec tons rappelant Pokémon et One Piece.
