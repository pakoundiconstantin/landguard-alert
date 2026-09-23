# Architecture du projet

## Vue d'ensemble

LandGuard Alert est un projet organisé en trois parties :

1. `frontend/` contient l'interface web de présentation et ses styles.
2. `backend/` contient l'application Django REST et les domaines métier.
3. `database/` contient le schéma Drizzle et les migrations SQL.

Cette séparation permet de faire évoluer l'interface, l'API et la persistance indépendamment.

## Responsabilités des dossiers

### `backend/`

Le backend utilise une application Django par domaine fonctionnel. Chaque application conserve ses modèles, sérialiseurs, vues, routes et migrations au même endroit.

| Dossier | Responsabilité |
| --- | --- |
| `landguard_python/` | Configuration globale, URLs racines, ASGI et WSGI |
| `accounts/` | Utilisateurs, rôles, authentification et permissions |
| `parcelles/` | Données cadastrales, parcelles et géométries |
| `plaintes/` | Déclaration et suivi des plaintes |
| `litiges/` | Gestion des dossiers de litiges et de leur évolution |
| `decisions/` | Enregistrement des décisions judiciaires |
| `alertes/` | Notifications et alertes métier |
| `dashboard/` | Indicateurs et vues de synthèse |
| `templates/` | Templates HTML rendus par Django |
| `static/` | CSS, JavaScript et autres ressources statiques |

### `frontend/`

Ce dossier contient la page de présentation publique du projet. Il ne doit pas contenir de logique Django ni de données sensibles.

### `database/`

Les fichiers de schéma et les migrations SQL sont regroupés ici. Les secrets de connexion restent dans des fichiers `.env` locaux et ne doivent jamais être commités.

### `docs/`

La documentation fonctionnelle et technique est stockée ici. Le cahier des charges reste séparé du code pour être facilement consultable lors de la soutenance.

## Règles de rangement

- Une nouvelle fonctionnalité métier doit être ajoutée dans l'application Django correspondante.
- Les migrations restent dans le dossier `migrations/` de leur application.
- Les fichiers temporaires, environnements virtuels, caches et rapports de crash ne sont pas versionnés.
- Les variables sensibles sont définies dans `backend/.env`; seul `backend/.env.example` peut servir de modèle versionné.
- Les fichiers partagés par plusieurs domaines doivent être placés dans un module clairement nommé, après vérification qu'ils ne relèvent pas d'une application métier existante.

## Commandes principales

Depuis `backend/` :

```powershell
python manage.py check
python manage.py migrate
python manage.py runserver
```

Depuis la racine :

```powershell
npm run lint
npm run build
```