# JurisFlow Municipal — prova de conceito

Ambiente de demonstração do **JurisFlow Municipal**, sistema de operação jurídica
com controle de acesso e rastreabilidade, publicado em
**[poc.tuitecnologia.com.br](https://poc.tuitecnologia.com.br)**.

> Todas as informações exibidas no sistema são **fictícias**. Este ambiente existe
> para apresentação comercial e validação de fluxo, não para uso real.

## O que é

Uma POC navegável, com autenticação própria e registro de acesso, feita para ser
apresentada a prefeituras e departamentos jurídicos. O foco não é o volume de
funcionalidade — é mostrar o controle: quem entrou, quando, e o que viu.

| Característica | Como está resolvido |
|---|---|
| Acesso | Convite de uso único, com sessão em cookie `httpOnly` + `secure` |
| Rastreabilidade | Todo evento gravado em `app_sessions` e na trilha de auditoria |
| Alerta de acesso | Notificação no Discord a cada login autenticado |
| Exposição | `noindex,nofollow,noarchive`; escuta apenas em `127.0.0.1` |
| Superfície | `helmet`, sem privilégio elevado, systemd com `ProtectSystem=strict` |

## Stack

Node 22 · Express 5 · PostgreSQL · React + Vite · TypeScript

## Rodando localmente

```bash
npm install
cp .env.example .env      # preencher DATABASE_URL e os segredos de sessão
psql "$DATABASE_URL" -f server/schema.sql
npm run dev               # front em modo Vite
npm start                 # servidor completo, serve o dist/
```

```bash
npm run seed:guest        # gera um convite de acesso
npm run access:report     # relatório de quem acessou
npm test
```

## Produção

Roda como serviço systemd, atrás de proxy reverso com TLS. O serviço nunca escuta
em interface pública — só em `127.0.0.1`, e o proxy publica o domínio.

```bash
# unidade em deploy/poc-tuitecnologia.service
sudo cp deploy/poc-tuitecnologia.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now poc-tuitecnologia
```

Variáveis de ambiente ficam em `/etc/poc-tuitecnologia.env`, fora da árvore do
projeto e com permissão `600` — nunca no repositório.

## Estrutura

```text
server/
  index.mjs         # servidor Express, sessão, rotas da API
  login-page.mjs    # tela de acesso renderizada no servidor
  security.mjs      # verificação de token, hash, proteção de sessão
  access-alert.mjs  # notificação de acesso
  access-report.mjs # relatório de acessos
  schema.sql        # esquema do banco
dist/               # front compilado, servido em produção
deploy/             # unidade systemd
```

---

**Tui Tecnologia**
