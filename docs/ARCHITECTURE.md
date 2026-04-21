# Architecture et Decisions Techniques

## Vue d'ensemble (ASCII)

```text
Developer
   |
   | git push / pull_request
   v
GitHub Repository
   |
   +--> GitHub Actions CI (tests, build, audit, docker build validation)
   |
   +--> GitHub Actions CD (main only)
            |
            | SSH + SCP
            v
      VPS Ubuntu 22.04 (1 vCPU, 1 GB RAM)
            |
            +--> Docker Compose (prod)
                  |
                  +--> frontend (Nginx, port 80 public)
                  |       |
                  |       +--> serve React static build
                  |       +--> reverse proxy /api -> backend:5000
                  |
                  +--> backend (Node.js/Express, private network)
                  |
                  +--> postgres (private network + persistent volume)
```

## Pourquoi Node.js + Express (vs NestJS, Fastify)

### Choix retenu

- Courbe d'apprentissage simple et rapide pour une equipe etudiante/projet agile.
- Ecosysteme mature (middlewares, auth JWT, validation, Sequelize, Swagger).
- Flexibilite totale pour structurer le code sans abstraction lourde.

### Pourquoi pas NestJS

- Excellent framework enterprise, mais plus de boilerplate et conventions strictes.
- Overhead initial plus eleve pour un MVP e-commerce.

### Pourquoi pas Fastify

- Performance superieure en brut, mais ecosysteme plugin parfois moins standard que Express.
- Besoin ici de simplicite et compatibilite outils/tests plus que de micro-optimisation.

## Pourquoi PostgreSQL (vs MongoDB)

- Donnees transactionnelles (panier -> commande -> order_items) avec forte coherence.
- Integrite relationnelle naturelle via FK et contraintes.
- Requetes analytiques et pagination robustes.

### Pourquoi pas MongoDB

- Modele document moins naturel pour commandes relationnelles et stock.
- Besoin de transactions multi-doc plus complexe pour ce cas.

## Pourquoi Docker Compose (vs Kubernetes, AWS ECS)

### Choix retenu

- Infrastructure cible: 1 VPS, 1 vCPU, 1 GB RAM.
- Compose est simple a operer, faible cout, faible complexite.
- Suffisant pour orchestrer 3 services (frontend, backend, db) avec healthchecks.

### Pourquoi pas Kubernetes/ECS

- Trop complexe pour la taille et le budget du projet.
- Coût operationnel et maintenance disproportionnes.

## Pourquoi Nginx en reverse proxy

- Sert efficacement les assets statiques React.
- Reverse proxy propre vers backend (`/api`).
- Ajout facile de cache, gzip, headers securite, timeouts.
- Point d'entree unique expose (port 80), backend/db restent prives.

## Decisions securite

- **JWT**: authentification stateless, simple pour API REST.
- **bcrypt**: hashage des mots de passe avec salt.
- **helmet**: headers HTTP de securite backend.
- **rate limiting**: limitation brute force / abus API.
- **UFW + fail2ban**: hardening serveur (SSH brute-force, restriction ports).
- **containers non-root**: reduction surface d'attaque runtime.
- **secrets via env**: pas de secrets dans le code source.

## Gestion memoire (VPS 1 GB RAM)

Contraintes appliquees:

- `mem_limit` Docker Compose:
  - postgres: `200m`
  - backend: `256m`
  - frontend/nginx: `128m`
- Swap de `1 GB` active sur le VPS (`/swapfile`)
- `vm.swappiness=10` pour limiter swap agressif
- Images alpine + multi-stage builds pour minimiser footprint
- Rotation logs (`json-file`, `max-size=10m`, `max-file=3`)

Resultat attendu:

- Stabilite acceptable sur faible RAM
- Redemarrage automatique (`restart: unless-stopped`)
- Observabilite legere via Netdata (localhost-only)
