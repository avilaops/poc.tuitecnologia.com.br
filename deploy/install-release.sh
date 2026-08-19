#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Uso: install-release.sh <arquivo-tar.gz> <release-id>" >&2
  exit 2
fi

ARCHIVE="$1"
RELEASE_ID="$2"
APP_ROOT="/opt/jurisflow-poc"
RELEASE_DIR="$APP_ROOT/releases/$RELEASE_ID"
ENV_FILE="/etc/jurisflow-poc.env"
DB_ROLE="jurisflow_poc_app"
DB_NAME="jurisflow_poc"

if ! id jurisflow >/dev/null 2>&1; then
  useradd --system --home-dir "$APP_ROOT" --shell /usr/sbin/nologin jurisflow
fi

install -d -o jurisflow -g jurisflow -m 0750 "$APP_ROOT" "$APP_ROOT/releases"

if [[ ! -f "$ENV_FILE" ]]; then
  DB_PASSWORD="$(openssl rand -hex 32)"
  ACCESS_LOG_SALT="$(openssl rand -hex 32)"
  umask 027
  {
    echo "NODE_ENV=production"
    echo "PORT=3012"
    echo "DATABASE_URL=postgresql://${DB_ROLE}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}"
    echo "ACCESS_LOG_SALT=${ACCESS_LOG_SALT}"
    echo "SESSION_TTL_HOURS=6"
  } > "$ENV_FILE"
  chown root:jurisflow "$ENV_FILE"
  chmod 0640 "$ENV_FILE"
else
  DB_PASSWORD="$(sed -nE 's#^DATABASE_URL=postgresql://[^:]+:([^@]+)@.*#\1#p' "$ENV_FILE")"
  if [[ -z "$DB_PASSWORD" ]]; then
    echo "DATABASE_URL existente não pôde ser interpretada com segurança." >&2
    exit 1
  fi
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 -v role="$DB_ROLE" -v pass="$DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'role', :'pass')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'role') \gexec
SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'role', :'pass') \gexec
SQL

if ! sudo -u postgres psql -P pager=off -Atqc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
  sudo -u postgres createdb --owner="$DB_ROLE" "$DB_NAME"
fi

install -d -o jurisflow -g jurisflow -m 0750 "$RELEASE_DIR"
tar -xzf "$ARCHIVE" -C "$RELEASE_DIR"
chown -R jurisflow:jurisflow "$RELEASE_DIR"

sudo -u jurisflow npm --prefix "$RELEASE_DIR" ci --omit=dev --no-audit --no-fund
ln -sfn "$RELEASE_DIR" "$APP_ROOT/current.next"
mv -Tf "$APP_ROOT/current.next" "$APP_ROOT/current"

install -o root -g root -m 0644 "$RELEASE_DIR/deploy/jurisflow-poc.service" /etc/systemd/system/jurisflow-poc.service
systemctl daemon-reload

echo "Release instalado em $RELEASE_DIR"

