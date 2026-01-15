#  Vytre - Éditeur de Procédures Opérationnelles

> Application fullstack moderne pour la création, l'édition et la visualisation de procédures opérationnelles étape par étape avec support multimédia.

##  Description

**Vytre** est une solution complète permettant de créer et de gérer des documents opérationnels structurés en blocs. Chaque bloc représente une étape avec une description, des images, des zones de texte personnalisées et un nombre de répétitions. L'application offre deux modes principaux : un **éditeur** pour créer et modifier les procédures, et un **lecteur** pour les consulter de manière optimale.

###  Points forts

- **Interface intuitive** avec drag & drop pour réorganiser les étapes
- **Éditeur de texte riche** (TipTap) avec formatage avancé (gras, italique, couleurs, etc.)
- **Gestion d'images** avec recadrage, zoom intelligent et visualisation responsive
- **Filtrage automatique** des blocs vides en mode lecture
- **Validation robuste** avec Zod côté client et serveur
- **Architecture moderne** avec Vue 3 Composition API + TypeScript

##  Tech Stack

### Frontend
![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.2-FFD859?style=flat&logo=pinia&logoColor=black)

- **Vue 3** - Framework progressif avec Composition API
- **TypeScript** - Typage statique pour une meilleure maintenabilité
- **Vite** - Build tool ultra-rapide
- **Pinia** - State management moderne et type-safe
- **TipTap** - Éditeur WYSIWYG extensible
- **Vue Advanced Cropper** - Recadrage d'images professionnel
- **VueDraggable** - Drag & drop fluide pour réorganiser les blocs
- **Zod** - Validation de schémas avec TypeScript
- **Vitest** - Framework de tests unitaires

### Backend
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)

- **Express.js** - Framework web minimaliste et flexible
- **Prisma ORM** - ORM moderne type-safe pour la base de données
- **TypeScript** - Typage côté serveur
- **Swagger** - Documentation API automatique
- **Jest** - Tests unitaires et d'intégration
- **Zod** - Validation des requêtes API

##  Architecture du Projet

```
vytre/
├── client/                      # Application Vue.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── applications/    # Vues principales (Editor, Lector, Menu)
│   │   │   ├── blocks/          # Composants de blocs opérationnels
│   │   │   ├── optionBar/       # Barres d'outils et formatage
│   │   │   ├── popup/           # Modales (Save, Delete, Crop, Zoom)
│   │   │   └── readerView/      # Composants mode lecture
│   │   ├── stores/              # État global Pinia
│   │   │   ├── blockStores.ts   # Gestion des blocs et documents
│   │   │   ├── textFormatStore.ts
│   │   │   ├── popupStore.ts
│   │   │   └── ...
│   │   ├── services/            # Services API
│   │   ├── types/               # Définitions TypeScript
│   │   ├── validators/          # Schémas de validation Zod
│   │   └── test/                # Tests unitaires
│   └── package.json
│
├── server/                      # API REST Express
│   ├── src/
│   │   ├── controllers/         # Logique métier
│   │   ├── managers/            # Couche d'accès aux données
│   │   ├── routes/              # Définition des routes
│   │   └── validators/          # Validation Zod
│   ├── prisma/
│   │   └── schema.prisma        # Schéma de base de données
│   └── package.json
│
└── package.json                 # Scripts racine (setup, dev)
```

### Composants Clés

#### **ReaderView**
- **ReaderViewBlock.vue** : Affiche un bloc opérationnel (numéro, description, images, répétitions)
- **ReaderViewWindow.vue** : Conteneur de prévisualisation en temps réel
- Filtre automatiquement les blocs vides pour une lecture optimale

#### **Modal de Zoom d'Image (ImageZoomPopUp.vue)**
- **Taille par défaut configurable** (500x500px par défaut)
- **Ratio dynamique** : préserve les proportions de l'image originale
- **Positionnement intelligent** : bouton de fermeture toujours visible en haut à droite
- **Backdrop filter** : effet de flou sur l'arrière-plan pour meilleure lisibilité
- **Responsive** : s'adapte à toutes les tailles d'écran

#### **BlockStores (Pinia)**
- Gestion centralisée des blocs opérationnels
- Sélection, ajout, suppression, réorganisation
- Sauvegarde et chargement de documents
- Synchronisation avec l'API backend

##  Installation

### Prérequis
- **Node.js** v18+ et npm
- Base de données compatible Prisma (PostgreSQL, MySQL, SQLite, etc.)

### 1. Cloner le dépôt
```bash
git clone <votre-repo>
cd vytre
```

### 2. Installer les dépendances
Pour installer toutes les dépendances du projet (racine, client et serveur) :
```bash
npm run setup
```

Cette commande installe automatiquement :
- Les dépendances racine (concurrently, etc.)
- Les dépendances du **client** (Vue, Pinia, TipTap, etc.)
- Les dépendances du **server** (Express, Prisma, etc.)

### 3. Configuration de la base de données
```bash
cd server
cp .env.example .env  # Créer et configurer votre fichier .env
npx prisma migrate dev  # Appliquer les migrations
npx prisma generate  # Générer le client Prisma
cd ..
```

##  Usage

### Lancer l'application en développement
Pour démarrer simultanément le client et le serveur :
```bash
npm run dev
```

Cette commande lance :
- **Serveur backend** → `http://localhost:3000`
- **Client frontend** → `http://localhost:5173`

Les deux applications se rechargent automatiquement lors de modifications.

### Lancer uniquement le client
```bash
npm run dev --prefix client
```

### Lancer uniquement le serveur
```bash
npm run dev --prefix server
```

### Tests
```bash
# Tests client
npm run test --prefix client
npm run test:coverage --prefix client

# Tests serveur
npm run test --prefix server
npm run test:coverage --prefix server
```

### Build pour production
```bash
# Client
npm run build --prefix client

# Serveur
npm run build --prefix server
npm start --prefix server
```

##  Fonctionnalités Détaillées

###  Mode Éditeur
- **Création de blocs** : Ajoutez des étapes avec description, images et répétitions
- **Éditeur riche TipTap** : Formatage texte (gras, italique, couleur, souligné)
- **Glisser-déposer** : Réorganisez les blocs par drag & drop
- **Zones de texte personnalisées** : Ajoutez des sections de texte supplémentaires
- **Gestion d'images** :
  - Upload d'images
  - Recadrage avec aperçu en temps réel
  - Prévisualisation avec zoom
- **Sauvegarde** : Exportez vos procédures avec titre personnalisé
- **Validation** : Vérification automatique des données avant sauvegarde

### Mode Lecteur
- **Affichage optimisé** : Interface épurée pour consultation
- **Filtrage intelligent** : Masque automatiquement les blocs vides
- **Navigation fluide** : Défilement vertical avec en-têtes fixes
- **Zoom d'images** : Cliquez sur une image pour l'agrandir dans une modal
  - Taille de zoom par défaut : **500x500px**
  - Conservation du ratio d'aspect original
  - Interface responsive avec fermeture facile

###  Styles et Design
- **CSS Scoped** : Isolation des styles par composant
- **Variables CSS** : Thème cohérent et maintenable
- **Backdrop filter** : Effet de flou élégant sur les modales
- **Positionnement absolu intelligent** : Boutons overlay toujours accessibles
- **Animations** : Transitions douces (modal fade, hover effects)
- **Responsive design** : S'adapte aux différentes tailles d'écran

##  API REST

Documentation Swagger disponible sur `http://localhost:3000/api-docs`

### Endpoints principaux
- `GET /api/documents` - Liste tous les documents
- `GET /api/documents/:id` - Récupère un document par ID
- `POST /api/documents` - Crée un nouveau document
- `PUT /api/documents/:id` - Met à jour un document
- `DELETE /api/documents/:id` - Supprime un document

##  Tests

Le projet inclut des tests unitaires complets :
- Tests des composants Vue avec **Vue Test Utils**
- Tests des stores Pinia avec **@pinia/testing**
- Tests de l'API avec **Supertest** et **Jest**
- Couverture de code disponible

##  Licence

Ce projet est sous licence privée pour usage IUT.

---

**Développé avec par l'équipe Vytre - IUT A2 SAÉ**