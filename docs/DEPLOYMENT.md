# Deployment Guide (VPS Ubuntu)

## Prerequis VPS

- Ubuntu 22.04 LTS
- Acces SSH avec utilisateur sudo
- Docker Engine + Docker Compose plugin installes
- Ports ouverts: `22`, `80`, `443`
- DNS/nom de domaine (optionnel mais recommande)

Si besoin, utilise `setup-vps.sh` a la racine du projet pour preparer le serveur.

## Etape 1 - Cloner le repo sur le VPS

```bash
ssh user@YOUR_VPS_IP
sudo mkdir -p /opt/ecommerce
sudo chown -R $USER:$USER /opt/ecommerce
cd /opt/ecommerce
git clone https://github.com/OWNER/REPO.git .
```

## Etape 2 - Configurer `.env.production`

```bash
cp .env.production.example .env.production
nano .env.production
```

Variables critiques a renseigner:

- `DB_PASSWORD`
- `JWT_SECRET`
- `CORS_ORIGIN`

## Etape 3 - Configurer les GitHub Secrets

Ajoute les secrets dans: **GitHub Repository > Settings > Secrets and variables > Actions**

| Secret | Description | Exemple |
|---|---|---|
| `VPS_HOST` | IP ou domaine du VPS | `203.0.113.10` |
| `VPS_USER` | Utilisateur SSH de deploiement | `deploy` |
| `VPS_PORT` | Port SSH | `22` |
| `VPS_SSH_KEY` | Cle privee SSH (multi-lignes) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | `StrongDbPass123!` |
| `JWT_SECRET` | Secret JWT long et aleatoire | `f4f9...` |
| `DISCORD_WEBHOOK_URL` (optionnel) | Notification de deploiement | `https://discord.com/api/webhooks/...` |

## Etape 4 - Premier deploiement manuel

Depuis le VPS:

```bash
cd /opt/ecommerce
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build
docker compose -f infrastructure/docker/docker-compose.prod.yml ps
curl http://localhost/api/health
```

Migration SQL (si applicable):

```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml exec -T backend npx sequelize-cli db:migrate
```

## Etape 5 - Deploiement automatique via GitHub Actions

1. Push sur `main`
2. Pipeline CI execute tests/builds/scans
3. Pipeline CD se declenche sur `main`
4. Actions CD:
   - copie des fichiers de deploiement sur VPS
   - `docker compose up -d --build`
   - migration DB (best effort)
   - healthcheck final

Conseil: protege la branche `main` avec checks CI obligatoires.

## Commandes utiles en production

### Etat des services

```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml ps
```

### Logs live

```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml logs -f
docker compose -f infrastructure/docker/docker-compose.prod.yml logs -f backend
```

### Restart d'un service

```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml restart backend
```

### Backup PostgreSQL

```bash
mkdir -p /opt/ecommerce/backups
docker compose -f infrastructure/docker/docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "/opt/ecommerce/backups/db-$(date +%F-%H%M).sql"
```

### Restore PostgreSQL

```bash
cat /opt/ecommerce/backups/db-YYYY-MM-DD-HHMM.sql | \
docker compose -f infrastructure/docker/docker-compose.prod.yml exec -T postgres \
  psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

## Depannage (Top 5)

### 1) CD echoue en SSH (permission denied)

- Verifie `VPS_USER`, `VPS_PORT`, `VPS_HOST`
- Verifie que la cle publique correspondante est dans `~/.ssh/authorized_keys`
- Verifie permissions:
  - `chmod 700 ~/.ssh`
  - `chmod 600 ~/.ssh/authorized_keys`

### 2) Backend inaccessible via `/api/health`

- Verifie services:
  - `docker compose ... ps`
  - `docker compose ... logs backend`
- Verifie `DB_HOST=postgres` et reseaux Docker
- Verifie que `nginx.conf` proxy bien vers `backend:5000`

### 3) Erreur DB connection refused

- Verifie conteneur postgres healthy
- Verifie credentials dans `.env.production`
- Verifie volume DB non corrompu:
  - `docker volume ls`
  - restaurer un backup si necessaire

### 4) Out of memory (VPS 1GB)

- Verifie swap active:
  - `free -h`
  - `swapon --show`
- Reduis charge applicative, nettoie images:
  - `docker image prune -f`
- Respecte les `mem_limit` du compose prod

### 5) Pipeline CI rouge sur audit

- Lance localement:
  - `npm audit --audit-level=high` backend/frontend
- Met a jour dependances vulnrables
- Re-teste puis push une correction
