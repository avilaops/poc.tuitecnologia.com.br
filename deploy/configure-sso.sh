#!/usr/bin/env bash
set -euo pipefail

POC_ENV="/etc/jurisflow-poc.env"
CLIENT_ENV="/opt/cliente-avila-inc/.env"

if [[ ! -f "$POC_ENV" || ! -f "$CLIENT_ENV" ]]; then
  echo "Arquivos de ambiente esperados não encontrados." >&2
  exit 1
fi

SSO_SECRET="$(sed -n 's/^POC_SSO_SECRET=//p' "$POC_ENV" | tail -1)"
if [[ -z "$SSO_SECRET" ]]; then
  SSO_SECRET="$(openssl rand -hex 48)"
fi

set_value() {
  local file="$1"
  local key="$2"
  local value="$3"
  sed -i "/^${key}=/d" "$file"
  printf '%s=%s\n' "$key" "$value" >> "$file"
}

set_value "$POC_ENV" "POC_SSO_SECRET" "$SSO_SECRET"
set_value "$POC_ENV" "POC_ALLOWED_EMAIL" "guest@tuitecnologia.com.br"
set_value "$CLIENT_ENV" "POC_SSO_SECRET" "$SSO_SECRET"
set_value "$CLIENT_ENV" "POC_GUEST_EMAIL" "guest@tuitecnologia.com.br"
set_value "$CLIENT_ENV" "POC_URL" "https://poc.avilaops.com"
set_value "$CLIENT_ENV" "NEXT_PUBLIC_APP_URL" "https://cliente.avila.inc"

chown root:jurisflow "$POC_ENV"
chmod 0640 "$POC_ENV"

echo "SSO configurado nos dois serviços sem expor o segredo."
