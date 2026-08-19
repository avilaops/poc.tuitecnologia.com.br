import type { AuditEvent, Connector, DebtCertificate, Jurisprudence, LegalProcess, PocRequirement } from './types'

export const processesSeed: LegalProcess[] = [
  {
    id: 'proc-1',
    number: '1008421-42.2026.8.26.0664',
    title: 'Execução fiscal — IPTU 2022/2024',
    party: 'Empresa Horizonte Ltda. — Executada (fictício)',
    area: 'Tributário',
    type: 'Execução fiscal',
    status: 'Para assinatura',
    priority: 'Crítica',
    owner: 'Dra. Helena Prado',
    deadline: 'Hoje, 17:00',
    value: 184250.8,
    court: 'TJSP',
    followed: true,
    movement: 'Petição gerada automaticamente e aguardando validação humana',
  },
  {
    id: 'proc-2',
    number: '5002198-10.2026.4.03.6106',
    title: 'Ação ordinária — responsabilidade civil',
    party: 'Marina Souza — Autora (fictício)',
    area: 'Cível',
    type: 'Judicial',
    status: 'Em análise',
    priority: 'Alta',
    owner: 'Dr. Rafael Nunes',
    deadline: 'Amanhã, 12:00',
    value: 68000,
    court: 'TRF-3',
    followed: false,
    movement: 'Intimação recebida pelo conector de demonstração',
  },
  {
    id: 'proc-3',
    number: 'ADM-2026/00481',
    title: 'Parecer — contratação emergencial',
    party: 'Secretaria de Saúde — Requerente (fictício)',
    area: 'Administrativo',
    type: 'Administrativo',
    status: 'Aguardando prazo',
    priority: 'Normal',
    owner: 'Dra. Alice Campos',
    deadline: '05 ago, 18:00',
    value: 0,
    court: '1DOC',
    followed: true,
    movement: 'Encaminhado à caixa de diligências; retorno automático em 24h',
  },
  {
    id: 'proc-4',
    number: '1009320-18.2026.8.26.0664',
    title: 'Execução fiscal — ISSQN',
    party: 'Comercial Ipê S.A. — Executada (fictício)',
    area: 'Tributário',
    type: 'Execução fiscal',
    status: 'Peticionado',
    priority: 'Normal',
    owner: 'Dra. Helena Prado',
    deadline: '08 ago, 16:00',
    value: 92640.55,
    court: 'TJSP',
    followed: true,
    movement: 'Lote P-260803-04 protocolado; recibo armazenado',
  },
  {
    id: 'proc-5',
    number: '0001872-54.2024.5.15.0027',
    title: 'Reclamação trabalhista',
    party: 'João Ribeiro — Reclamante (fictício)',
    area: 'Trabalhista',
    type: 'Judicial',
    status: 'Em análise',
    priority: 'Alta',
    owner: 'Dr. Rafael Nunes',
    deadline: '06 ago, 14:30',
    value: 31500,
    court: 'TRT-15',
    followed: false,
    movement: 'IA classificou a matéria com 94% de confiança; revisão pendente',
  },
]

export const debtSeed: DebtCertificate[] = [
  { id: 'cda-1', cda: 'CDA-2026-01842', taxpayer: 'Mercado Aurora Ltda. (fictício)', principal: 43820.4, updated: 47291.18, prescription: '14/02/2027', status: 'Elegível', eligibleCnj: false },
  { id: 'cda-2', cda: 'CDA-2026-01843', taxpayer: 'Carlos Freire (fictício)', principal: 8950.25, updated: 9682.75, prescription: '22/03/2027', status: 'Em revisão', eligibleCnj: true },
  { id: 'cda-3', cda: 'CDA-2026-01844', taxpayer: 'Oficina Central Ltda. (fictício)', principal: 127440, updated: 139873.9, prescription: '09/06/2027', status: 'Elegível', eligibleCnj: false },
  { id: 'cda-4', cda: 'CDA-2026-01845', taxpayer: 'Ana Martins (fictício)', principal: 3480.7, updated: 3749.4, prescription: '18/11/2026', status: 'REFIS', eligibleCnj: true },
]

export const auditSeed: AuditEvent[] = [
  { id: 'aud-1', at: '03/08/2026 16:42', actor: 'Motor de prazos', action: 'Prazo recalculado', target: '1008421-42.2026.8.26.0664', source: 'Automação', detail: 'Feriado municipal aplicado; vencimento mantido após validação.' },
  { id: 'aud-2', at: '03/08/2026 16:18', actor: 'Dra. Helena Prado', action: 'Minuta validada', target: 'Petição PE-1842', source: 'Usuário', detail: 'Documento aprovado para assinatura A3 em lote.' },
  { id: 'aud-3', at: '03/08/2026 15:54', actor: 'Classificador jurídico', action: 'Processo classificado', target: '0001872-54.2024.5.15.0027', source: 'IA', detail: 'Trabalhista / Contestação / Alta complexidade. Confiança 94%.' },
  { id: 'aud-4', at: '03/08/2026 15:31', actor: 'Conector TJSP (demo)', action: 'Movimento capturado', target: '1009320-18.2026.8.26.0664', source: 'Integração', detail: 'Recibo fictício vinculado ao processo para demonstração.' },
]

export const pocRequirements: PocRequirement[] = [
  { ref: 'REF 01', title: 'Cadastro, perfis e permissões', coverage: 'Demonstrável', view: 'users', evidence: 'Criação real de usuário e senha, perfis com permissões e trilha de acesso.' },
  { ref: 'REF 02', title: 'Funcionalidades gerais', coverage: 'Demonstrável', view: 'processes', evidence: 'Processos, prazos, peças, busca global (⌘K), PDF, IA e fluxos.' },
  { ref: 'REF 03', title: 'Cálculo e ajuizamento de CDA', coverage: 'Demonstrável', view: 'debt', evidence: 'Atualização monetária, REFIS e formação de lote.' },
  { ref: 'REF 04', title: 'Monitoramento de processos', coverage: 'Demonstrável', view: 'processes', evidence: 'Histórico, responsáveis, movimentos e distribuição.' },
  { ref: 'REF 05', title: 'Gestão de fluxo de trabalho', coverage: 'Demonstrável', view: 'workflows', evidence: 'Etapas, caixas de espera, alertas e indicadores.' },
  { ref: 'REF 06', title: 'Integrações', coverage: 'Demonstrável', view: 'integrations', evidence: 'Consulta processual real via API Pública DataJud/CNJ: TJSP, TRF-3, TRT-15, STJ e TST.' },
  { ref: 'REF 07', title: 'Citações, intimações e peças', coverage: 'Demonstrável', view: 'petitions', evidence: 'Recebimento eletrônico, modelos dinâmicos e petição em lote.' },
  { ref: 'REF 08', title: 'Inteligência artificial', coverage: 'Demonstrável', view: 'ai', evidence: 'Classificação determinística, justificativa, confiança e validação humana.' },
  { ref: 'REF 09', title: 'Extinção ou suspensão automática', coverage: 'Demonstrável', view: 'debt', evidence: 'Varredura com fundamento em STF Tema 1184, Resolução CNJ 547/2024 e súmulas do STJ.' },
  { ref: 'REF 10', title: 'Assinatura digital A3', coverage: 'Demonstrável', view: 'petitions', evidence: 'Assinatura PAdES real no servidor; certificado ICP-Brasil A1 configurável e A3 via driver PKCS#11.' },
]

export const connectors: Connector[] = [
  { name: 'TJSP', group: 'Justiça Estadual', mode: 'real', tribunal: 'TJSP', detail: 'Processos, classes, órgãos e movimentos' },
  { name: 'TRF-3', group: 'Justiça Federal', mode: 'real', tribunal: 'TRF-3', detail: 'Processos e movimentos' },
  { name: 'TRT-15', group: 'Justiça do Trabalho', mode: 'real', tribunal: 'TRT-15', detail: 'Processos e movimentos' },
  { name: 'STJ', group: 'Tribunais superiores', mode: 'real', tribunal: 'STJ', detail: 'Processos e movimentos' },
  { name: 'TST', group: 'Tribunais superiores', mode: 'real', tribunal: 'TST', detail: 'Processos e movimentos' },
  { name: 'STF', group: 'Tribunais superiores', mode: 'convenio', detail: 'Processos e movimentos', pending: 'O STF não integra o DataJud/CNJ; consulta via portal próprio do tribunal.' },
  { name: 'DJEN / Comunicações CNJ', group: 'CNJ', mode: 'convenio', detail: 'Citações e intimações eletrônicas', pending: 'API pública exige egresso de rede no Brasil; roteamento nacional em homologação.' },
  { name: 'SEI / PEN', group: 'Administrativo', mode: 'convenio', detail: 'Documentos e metadados', pending: 'Depende de convênio e credenciais do órgão.' },
  { name: '1DOC', group: 'Administrativo', mode: 'convenio', detail: 'Processos e ofícios', pending: 'Depende de contrato com a plataforma.' },
  { name: 'Tributário municipal', group: 'Município', mode: 'demo', detail: 'CDAs, pagamentos e REFIS' },
]

export const jurisprudenceSeed: Jurisprudence[] = [
  { ref: 'STF — Tema 1184 (RE 1.355.208)', scope: 'Extinção', holding: 'É legítima a extinção de execução fiscal de baixo valor pela ausência de interesse de agir, ante o custo do processo e o princípio da eficiência administrativa.' },
  { ref: 'Resolução CNJ nº 547/2024', scope: 'Extinção', holding: 'Autoriza a extinção de execuções fiscais de valor inferior a R$ 10 mil, sem movimentação útil há mais de um ano e sem citação ou bens penhoráveis.' },
  { ref: 'Súmula 452/STJ', scope: 'Suspensão', holding: 'A extinção das ações de pequeno valor é faculdade da Administração Federal, vedada a atuação judicial de ofício — a suspensão exige critério do ente credor.' },
  { ref: 'Súmula 409/STJ', scope: 'Prescrição', holding: 'Em execução fiscal, a prescrição ocorrida antes da propositura da ação pode ser decretada de ofício (art. 219, § 5º, do CPC).' },
]

export const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

