# Declaração Técnica — Backup, Recuperação e Monitoramento

Atende ao item 6.4.42 do Termo de Referência (Pregão Eletrônico nº 110/2026).
Descreve o que está **efetivamente configurado** no ambiente da prova de
conceito; em produção contratada os mesmos controles são dimensionados por SLA.

## Backup

- **Rotina diária automatizada** (`/etc/cron.daily/jurisflow-poc-backup`):
  `pg_dump` completo do banco PostgreSQL, comprimido (gzip) e gravado com
  permissão `600` em `/opt/backups/jurisflow-poc/`.
- **Retenção**: 14 dias no ambiente de POC (produção: 30 dias + cópia mensal).
- **Verificação**: a rotina falha ruidosamente (cron reporta erro) se o dump
  não concluir; o arquivo do dia é evidência de execução.

## Recuperação

- **RPO (perda máxima de dados)**: 24 horas no ambiente de POC.
- **RTO (tempo de restauração)**: inferior a 1 hora — procedimento:

```bash
gunzip -c /opt/backups/jurisflow-poc/jurisflow-AAAAMMDD-HHMMSS.sql.gz \
  | psql "$DATABASE_URL"
systemctl restart jurisflow-poc
```

- O código da aplicação é reconstruível a qualquer momento a partir do
  repositório Git (deploy versionado com releases e backups pré-deploy em
  `/opt/jurisflow-poc/`).

## Monitoramento proativo

- **systemd** supervisiona o serviço (`jurisflow-poc.service`) com reinício
  automático e journal centralizado.
- **Endpoint `/health`** verifica aplicação e banco a cada consulta do proxy.
- **Alertas de acesso** em tempo real via webhook (Discord) a cada login.
- **Sonda externa** (Blackbox Exporter em servidor independente) testa os
  endpoints públicos continuamente.
- Painel "Monitoramento" da própria aplicação exibe latência de banco,
  sessões ativas, logins e falhas das últimas 24h.

## Segurança do ambiente

- Serviço escuta apenas em `127.0.0.1`, atrás de proxy TLS (Caddy).
- Segredos fora da árvore do projeto (`/etc/jurisflow-poc.env`, `600`).
- Senhas com hash scrypt; sessões em cookie `httpOnly`/`secure`; trilha de
  auditoria imutável de todos os eventos.

---
Tui Tecnologia · poc.tuitecnologia.com.br
