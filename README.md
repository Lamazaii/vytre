# vytre

## Installation

Pour installer toutes les dépendances du projet (racine, client et serveur), exécutez la commande suivante à la racine du projet :

```bash
npm run setup
```

Cette commande installe automatiquement les dépendances dans les trois dossiers :
- Le dossier racine (pour la gestion du projet et les outils comme `concurrently`)
- Le dossier `client` (application front-end)
- Le dossier `server` (application back-end)

## Lancement du projet

Pour lancer simultanément le client et le serveur en mode développement, exécutez :

```bash
npm run dev
```

Cette commande démarre les deux applications en parallèle :
- Le serveur back-end sur son port configuré 3000
- Le client front-end sur son port configuré 5173

Les deux applications se rechargeront automatiquement lors de modifications de fichiers.