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
| Acesso | Usuário e senha (scrypt) ou convite de uso único, com sessão em cookie `httpOnly` + `secure` |
| Integração real | Consulta processual via API Pública DataJud/CNJ (TJSP, TRF-3, TRT-15, STJ, TST) |
| Assinatura digital | PAdES real no servidor (CMS/PKCS#7); certificado A1 via `SIGN_P12_PATH`, A3 via PKCS#11 |
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
src/                # front React + Vite (código-fonte)
  App.tsx           # telas da POC (busca global, usuários, integrações, assinatura…)
  data.ts           # dados fictícios e matriz de requisitos REF-01..REF-10
  lib/demoEngine.ts # classificador determinístico da triagem com IA
server/
  index.mjs         # servidor Express, sessão, rotas da API
  users.mjs         # criação de usuários com senha, perfis e login local
  integrations.mjs  # consulta processual real — API Pública DataJud/CNJ
  signing.mjs       # geração e assinatura PAdES real de petições
  login-page.mjs    # tela de acesso renderizada no servidor
  security.mjs      # verificação de token, hash scrypt, proteção de sessão
  access-alert.mjs  # notificação de acesso
  access-report.mjs # relatório de acessos
  schema.sql        # esquema do banco
dist/               # front compilado, servido em produção
deploy/             # unidade systemd e scripts de instalação
docs/               # roteiro de apresentação da POC
```

## Variáveis das integrações e da assinatura

| Variável | Uso |
|---|---|
| `DATAJUD_API_KEY` | Chave da API Pública DataJud (padrão: chave pública documentada pelo CNJ) |
| `SIGN_P12_PATH` | Certificado A1 (PKCS#12); sem ele, gera certificado de teste em `var/` |
| `SIGN_P12_PASSWORD` | Senha do PKCS#12 |
| `SIGN_PKCS11_MODULE` | Caminho do driver PKCS#11 para token A3 (opcional) |

> A assinatura produzida é sempre um PAdES real. Com certificado de teste ela
> demonstra o mecanismo; com e-CPF/e-CNPJ ICP-Brasil (A1 ou A3) passa a ter
> validade jurídica plena — sem mudança de código.

---

**Tui Tecnologia**
