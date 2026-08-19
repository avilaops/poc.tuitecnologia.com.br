# Roadmap — da POC à implantação assistida em 90 dias

Este roadmap parte da POC atual e organiza uma evolução possível dentro do prazo de implantação previsto no item 6.1.1 do Termo de Referência. As datas contam a partir da ordem de início e precisam ser recalibradas depois do acesso aos ambientes, dados e responsáveis da Contratante.

## Estado entregue em 3 de agosto de 2026

- POC React/TypeScript navegável e responsiva;
- publicação protegida em `poc.avilaops.com` por Cloudflare e Caddy;
- acesso centralizado no portal `cliente.avila.inc` com conta de apresentação;
- SSO assinado de uso único, sessão segura e PostgreSQL no servidor;
- registro de tentativas anônimas e acessos autenticados com IP pseudonimizado;
- alerta privado de login autenticado e relatório operacional de acessos;
- modo de apresentação guiada, restauração dos dados fictícios e navegação mobile em cartões;
- painel protegido de visitantes com métricas reais, eventos recentes e identidade pseudonimizada;
- monitoramento de aplicação, PostgreSQL, portal de entrada e configuração do alerta;
- relatório pós-apresentação com exportação JSON e impressão/salvamento em PDF;
- organizador demonstrativo de sessões individuais, com criação e revogação locais sem prometer convite autenticado;
- central de controles de segurança e matriz de validação mobile que distinguem evidência, recomendação e teste físico pendente;
- testes automatizados do motor demonstrativo e das funções de segurança;
- integrações jurídicas externas, persistência do domínio, assinatura A3 e aceite formal continuam nas fases abaixo.

## Princípios de entrega

- uma matriz de aderência por alínea é a fonte de verdade;
- nenhuma integração é considerada pronta sem teste no ambiente do órgão de destino;
- decisões jurídicas sugeridas por automação ou IA exigem validação humana;
- auditoria, exportação e portabilidade de dados fazem parte do produto desde o início;
- segurança, LGPD e recuperação não ficam para a última fase;
- todo marco termina com evidência executável e termo de aceite, não apenas documentação.

## Fase 0 — preparação para a POC oficial (D-5 a D0)

Objetivo: tornar a demonstração repetível e reduzir riscos de desclassificação.

- decompor cada alínea do item 12.7 em passos observáveis e critério objetivo;
- definir a regra de contagem do percentual de 90% com a comissão;
- substituir conceitos de interface ainda estáticos por ações verificáveis;
- preparar massa fictícia consistente, inclusive CPF/CNPJ somente se indispensável;
- montar ambiente offline de contingência e roteiro de até seis horas;
- gravar evidências, logs e versão exata da aplicação apresentada;
- ensaiar recuperação após falha de rede, navegador ou equipamento;
- obter atestado de capacidade técnica exigido no item 11.1.4.

**Saída:** matriz assinável, pacote versionado, roteiro cronometrado, relatório prévio e plano de contingência.

## Fase 1 — fundação segura e descoberta (dias 1–15)

Objetivo: transformar a interface aprovada em plataforma multiusuário governável.

- oficinas de processos judiciais, administrativos, dívida ativa e suporte;
- inventário de dados, sistemas legados, volumes, formatos e responsáveis;
- arquitetura TypeScript com frontend, API, fila de jobs e banco relacional;
- autenticação institucional, RBAC por perfil, sessão segura e MFA quando aplicável;
- trilha de auditoria append-only com correlação de eventos;
- criptografia em trânsito e repouso, gestão de segredos e política de retenção;
- ambientes separados de desenvolvimento, homologação e produção;
- plano LGPD, classificação de dados e registro das bases legais;
- backup automatizado e primeiro teste de restauração.

**Marco de aceite:** login/perfis reais, cadastro básico persistente, auditoria consultável e restauração comprovada em homologação.

## Fase 2 — núcleo processual e administrativo (dias 16–35)

Objetivo: entregar a operação diária sem depender ainda de todos os conectores.

- cadastro completo, pasta digital, importação PDF e pesquisa;
- processos judiciais e administrativos com histórico unificado;
- motor de prazos com calendários, feriados, regras e alertas;
- distribuição manual/automática por matéria, carga e afastamento;
- caixas de trabalho, diligência, retorno automático e avocação;
- modelos com campos dinâmicos, versionamento e compartilhamento;
- construtor de fluxos/formulários com responsáveis e SLA;
- notificações por e-mail e painel de pendências;
- relatórios básicos e exportação em formatos abertos.

**Marco de aceite:** fluxo completo de uma intimação fictícia até a peça validada, com permissões e auditoria reais.

## Fase 3 — dívida ativa e execução fiscal (dias 36–55)

Objetivo: cobrir o ciclo de CDA, cálculo, REFIS e ajuizamento.

- importação e conciliação de CDAs com o sistema tributário;
- padrões versionados de juros, multa e correção monetária;
- memória de cálculo reproduzível e conferência por amostragem;
- cadastro e aplicação de regras de REFIS;
- controle de prescrição, seleção e formação de lotes;
- geração de processo, documento e petição vinculada;
- monitoramento de quitação, parcelamento e pagamento parcial;
- critérios CNJ parametrizáveis para proposta de extinção/suspensão;
- revisão humana, relatórios e cancelamento coordenado da cobrança.

**Marco de aceite:** lote de CDAs percorre importação, cálculo, validação, assinatura em homologação e retorno de status sem perda de rastreabilidade.

## Fase 4 — integrações e assinatura (dias 56–72)

Objetivo: trocar os adaptadores simulados por integrações homologadas prioritárias.

- definir prioridade real entre TJSP, TRF-3, TRT-15, PJe, e-Proc e Domicílio Judicial;
- formalizar acessos, convênios, limites e responsabilidade de cada integração;
- implementar conectores idempotentes com filas, retry, dead-letter e observabilidade;
- homologar captura de intimação, movimento, prazo, protocolo e recibo;
- integrar PEN/SEI, 1DOC e sistema tributário conforme interfaces disponíveis;
- disponibilizar API documentada, versionada e autenticada;
- implantar assinatura A3 com middleware compatível, confirmação explícita e evidência ICP-Brasil;
- executar testes de lote, indisponibilidade, duplicidade e retorno parcial.

**Marco de aceite:** pelo menos os conectores eliminatórios funcionam ponta a ponta no ambiente de homologação, com certificado e recibos válidos.

## Fase 5 — IA responsável, hardening e implantação (dias 73–90)

Objetivo: concluir automações avançadas e comprovar prontidão operacional.

- pipeline de leitura/classificação com métricas por classe e período;
- base de avaliação com anonimização e revisão dos procuradores;
- explicabilidade, confiança mínima, fila de exceção e intervenção humana;
- apoio à elaboração de peças com fontes rastreáveis e bloqueio de envio autônomo;
- testes de carga para 10–20 usuários e operações em lote;
- revisão de segurança, SAST/DAST, dependências e teste de autorização;
- teste de restauração, continuidade e exportação integral da base;
- migração piloto, reconciliação de contagens e relatório de divergências;
- treinamento presencial/remoto, manuais e operação assistida;
- monitoramento, suporte, SLA, manutenção corretiva/evolutiva e governança de releases.

**Marco final:** aceite técnico, plano de reversão, base reconciliada, usuários treinados e operação assistida iniciada.

## Trilha paralela de homologação externa

As integrações normalmente são o caminho crítico e devem começar no primeiro dia, mesmo quando a implementação ocorre na Fase 4.

| Dependência | Evidência necessária | Risco principal |
|---|---|---|
| TJSP / e-SAJ | consulta, intimação, protocolo e recibo reais | acesso e alterações de interface |
| PJe / TRF-3 / TRT-15 | autenticação, captura e protocolo homologados | certificados e diferenças por tribunal |
| STJ / TST / STF | escopo e mecanismo técnico confirmados | ausência ou restrição de API |
| Domicílio Judicial CNJ | ambiente e credencial institucional | dependência de habilitação do Município |
| SEI / PEN | barramento e tipo de documento testados | versões e regras do órgão |
| 1DOC | contrato de API e limites definidos | disponibilidade comercial/técnica |
| Sistema tributário | layout de CDA, pagamento e REFIS reconciliado | qualidade e propriedade dos dados |
| A3 / ICP-Brasil | token, driver e cadeia válidos em homologação | compatibilidade do equipamento |

## Métricas de prontidão

- 100% das alíneas do item 12.7 com evidência, justificativa e responsável;
- pelo menos 90% aprovadas segundo a regra formal da comissão;
- zero envio externo sem confirmação humana;
- zero credencial em código ou documentação;
- 100% dos eventos críticos na trilha de auditoria;
- restauração de backup e exportação integral testadas;
- contagens de migração conciliadas antes/depois;
- conectores eliminatórios validados ponta a ponta;
- erros de lote recuperáveis sem duplicidade;
- suporte, contingência e responsáveis definidos antes da entrada em produção.

## Fora do escopo desta POC

Banco de produção para os dados jurídicos, integrações reais, migração, assinatura A3, emissão de e-mail, OCR, backup validado, recuperação de desastre, observabilidade completa, suporte e certificação de segurança pertencem ao roadmap. O PostgreSQL já implantado nesta etapa limita-se a autenticação, sessão e auditoria de acesso da demonstração. Sessões individuais autenticadas ainda exigem IAM administrativo próprio; a interface atual organiza apenas sessões simuladas para validação de jornada e apresentação técnica controlada.
