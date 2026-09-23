# LandGuard Python

Projet Django REST pour la gestion des parcelles, plaintes, litiges, décisions et alertes foncières.

## Stack
- Python 3.12+
- Django 5
- Django REST Framework
- PostgreSQL + PostGIS
- JWT pour l’authentification
- Architecture modulaire par domaines métier

## Structure

- `landguard_python/` : configuration principale du projet
- `accounts/` : gestion des utilisateurs et rôles
- `parcelles/` : gestion des parcelles et géométries
- `plaintes/` : gestion des plaintes
- `litiges/` : gestion des litiges
- `decisions/` : gestion des décisions judiciaires
- `alertes/` : génération et suivi des alertes
- `dashboard/` : synthèse de l’activité

## Lancer le projet

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Base PostgreSQL

Copier `.env.example` vers `.env`, puis renseigner le mot de passe de l'utilisateur PostgreSQL local.

```powershell
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

La configuration Django utilise PostgreSQL sur `localhost:5432` avec les variables `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` et `DB_PORT`. Supabase et SQLite ne sont plus utilisés.
