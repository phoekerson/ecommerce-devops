# E-commerce DevOps Platform

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![CD](https://github.com/OWNER/REPO/actions/workflows/cd.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/cd.yml)
[![Coverage](https://img.shields.io/badge/coverage-70%25-brightgreen)](#tests-et-qualite)

Application e-commerce full stack avec frontend React, backend Node.js/Express et base PostgreSQL.  
Le projet est conçu pour un déploiement simple sur VPS via Docker Compose et GitHub Actions.  
L'objectif est de fournir une base production-ready avec sécurité, CI/CD et monitoring léger.

## Stack Technique

| Couche | Technologies |
|---|---|
| Frontend | React 18, TypeScript, React Router v6, Axios, TanStack Query, TailwindCSS, Nginx |
| Backend | Node.js, Express, TypeScript, Sequelize, JWT, bcrypt, Winston, Swagger |
| Base de données | PostgreSQL 15 |
| DevOps | Docker, Docker Compose, GitHub Actions (CI/CD), UFW, Fail2ban, Netdata |

## Prerequis

- Node.js 18+
- npm 9+
- Docker + Docker Compose plugin v2
- Git

## Installation Locale (5 commandes)

```bash
git clone https://github.com/OWNER/REPO.git
cd REPO
cp src/backend/.env.example src/backend/.env
cp src/frontend/.env.example src/frontend/.env
docker compose -f infrastructure/docker/docker-compose.dev.yml up --build
```

## Variables d'Environnement

### Backend (`src/backend/.env`)

| Variable | Description | Exemple |
|---|---|---|
| `NODE_ENV` | Environnement d'execution | `development` |
| `PORT` | Port du backend | `5000` |
| `DB_HOST` | Hote PostgreSQL | `postgres` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base | `ecommerce` |
| `DB_USER` | Utilisateur DB | `postgres` |
| `DB_PASSWORD` | Mot de passe DB | `postgres` |
| `JWT_SECRET` | Secret de signature JWT | `change_me` |
| `CORS_ORIGIN` | Origines autorisees | `http://localhost:3000` |

### Frontend (`src/frontend/.env`)

| Variable | Description | Exemple |
|---|---|---|
| `VITE_API_URL` | URL de base de l'API backend | `http://localhost:5000` |

## Commandes de Developpement

### Backend

```bash
cd src/backend
npm run dev
npm test
npm run build
```

### Frontend

```bash
cd src/frontend
npm run dev
npm run build
```

## Architecture du Projet

```text
ecommerce-devops/
├── .github/workflows/          # CI/CD GitHub Actions
├── docs/                       # Documentation technique
├── infrastructure/
│   ├── docker/                 # Dockerfiles + compose dev/prod
│   └── nginx/                  # Reverse proxy et SPA config
├── src/
│   ├── backend/                # API Express + Sequelize + tests Jest
│   └── frontend/               # App React + TypeScript
└── setup-vps.sh                # Provisioning Ubuntu VPS
```

## Endpoints API

| Methode | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Inscription utilisateur | Public |
| `POST` | `/api/auth/login` | Connexion + JWT | Public |
| `GET` | `/api/auth/me` | Profil courant | JWT |
| `GET` | `/api/products` | Liste produits paginee | Public |
| `GET` | `/api/products/:id` | Detail produit | Public |
| `POST` | `/api/products` | Creation produit | JWT Admin |
| `PUT` | `/api/products/:id` | Modification produit | JWT Admin |
| `DELETE` | `/api/products/:id` | Suppression produit | JWT Admin |
| `GET` | `/api/cart` | Panier utilisateur | JWT |
| `POST` | `/api/cart` | Ajout article panier | JWT |
| `DELETE` | `/api/cart/:id` | Suppression article panier | JWT |
| `GET` | `/api/orders` | Historique commandes | JWT |
| `POST` | `/api/orders` | Creer commande depuis panier | JWT |
| `GET` | `/api/health` | Healthcheck applicatif | Public |

## Tests et Qualite

- Backend: Jest + Supertest + couverture minimale cible 70%
- Frontend: build de verification dans CI
- Securite: `npm audit --audit-level=high` sur backend et frontend

## Contribution

1. Creer une branche feature:
   - `feature/nom-court` ou `fix/nom-court`
2. Commits atomiques:
   - style recommande: `feat:`, `fix:`, `docs:`, `ci:`, `refactor:`
3. Ouvrir une Pull Request vers `main` avec:
   - description du changement
   - plan de test
   - captures d'ecran si UI
4. Attendre le vert CI avant merge.

## Licence

Projet distribue sous licence MIT. Voir le fichier `LICENSE` si present, sinon ajoute-le avant publication.
