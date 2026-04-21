#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "This script must be run as root (use: sudo bash setup-vps.sh)"
  exit 1
fi

CURRENT_USER="${SUDO_USER:-root}"
PROJECT_DIR="/opt/ecommerce"
LOG_DIR="/opt/ecommerce/logs"
ENV_FILE="/opt/ecommerce/.env.production"
SWAP_FILE="/swapfile"

echo "[1/8] System update..."
apt update
DEBIAN_FRONTEND=noninteractive apt upgrade -y

echo "[2/8] Installing Docker Engine + Docker Compose plugin..."
apt install -y ca-certificates curl gnupg lsb-release ufw fail2ban

install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

ARCH="$(dpkg --print-architecture)"
CODENAME="$(. /etc/os-release && echo "${VERSION_CODENAME}")"
echo \
  "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${CODENAME} stable" \
  > /etc/apt/sources.list.d/docker.list

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker

if id -nG "${CURRENT_USER}" | grep -qw docker; then
  echo "User ${CURRENT_USER} is already in docker group."
else
  usermod -aG docker "${CURRENT_USER}"
  echo "Added ${CURRENT_USER} to docker group. Re-login required to apply group changes."
fi

echo "[3/8] Configuring 1GB swap..."
if swapon --show | grep -q "${SWAP_FILE}"; then
  echo "Swap already active on ${SWAP_FILE}."
else
  if [[ ! -f "${SWAP_FILE}" ]]; then
    fallocate -l 1G "${SWAP_FILE}" || dd if=/dev/zero of="${SWAP_FILE}" bs=1M count=1024 status=progress
  fi
  chmod 600 "${SWAP_FILE}"
  mkswap "${SWAP_FILE}"
  swapon "${SWAP_FILE}"
fi

if ! grep -q "^${SWAP_FILE} " /etc/fstab; then
  echo "${SWAP_FILE} none swap sw 0 0" >> /etc/fstab
fi

if grep -q "^vm.swappiness=" /etc/sysctl.conf; then
  sed -i 's/^vm.swappiness=.*/vm.swappiness=10/' /etc/sysctl.conf
else
  echo "vm.swappiness=10" >> /etc/sysctl.conf
fi
sysctl -p

echo "[4/8] Configuring firewall and fail2ban..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

systemctl enable fail2ban
systemctl restart fail2ban

echo "[5/8] Creating project structure..."
mkdir -p "${PROJECT_DIR}" "${LOG_DIR}"
chown -R "${CURRENT_USER}:${CURRENT_USER}" "${PROJECT_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  cat > "${ENV_FILE}" <<'EOF'
NODE_ENV=production
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=ecommerce_user
DB_PASSWORD=CHANGE_ME
JWT_SECRET=CHANGE_ME
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://TON_IP_VPS
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
EOF
  chmod 600 "${ENV_FILE}"
  chown "${CURRENT_USER}:${CURRENT_USER}" "${ENV_FILE}"
fi

echo "[6/8] Installing Netdata (localhost only)..."
export NETDATA_DISABLE_TELEMETRY=1
bash <(curl -Ss https://my-netdata.io/kickstart.sh) --non-interactive --dont-wait

NETDATA_CONF="/etc/netdata/netdata.conf"
if [[ -f "${NETDATA_CONF}" ]]; then
  if grep -q "^bind to =" "${NETDATA_CONF}"; then
    sed -i 's/^bind to =.*/bind to = 127.0.0.1/' "${NETDATA_CONF}"
  else
    sed -i '/^\[web\]/a bind to = 127.0.0.1' "${NETDATA_CONF}"
  fi
  systemctl restart netdata
fi

echo "[7/8] SSH key instructions for GitHub Actions"
cat <<'EOF'
Run the following commands as your deploy user (NOT root) to create a dedicated CI/CD key:

  ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

Then add the public key on the VPS:

  cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  chmod 700 ~/.ssh

Add the private key content to GitHub Secret:
  VPS_SSH_KEY = contents of ~/.ssh/github_actions_deploy

Also configure:
  VPS_HOST, VPS_USER, VPS_PORT, DB_PASSWORD, JWT_SECRET
EOF

echo "[8/8] Final verification"
docker --version
docker compose version
free -h
swapon --show
ufw status verbose

echo "✓ VPS setup complete. Re-login to apply docker group membership for ${CURRENT_USER}."
