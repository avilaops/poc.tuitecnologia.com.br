#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="/etc/jurisflow-poc.env"
IFS= read -r WEBHOOK_URL
WEBHOOK_URL="${WEBHOOK_URL%$'\r'}"

if [[ ! "$WEBHOOK_URL" =~ ^https://(discord\.com|discordapp\.com)/api/webhooks/ ]]; then
  echo "Webhook Discord inválido." >&2
  exit 1
fi

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

grep -v '^ACCESS_ALERT_WEBHOOK_URL=' "$ENV_FILE" > "$TMP_FILE"
printf 'ACCESS_ALERT_WEBHOOK_URL=%s\n' "$WEBHOOK_URL" >> "$TMP_FILE"
install -o root -g jurisflow -m 0640 "$TMP_FILE" "$ENV_FILE"

echo "Alerta de acesso configurado no ambiente protegido."
