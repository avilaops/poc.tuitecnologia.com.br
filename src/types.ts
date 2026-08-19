export type ViewId =
  | 'overview'
  | 'processes'
  | 'debt'
  | 'deadlines'
  | 'petitions'
  | 'workflows'
  | 'ai'
  | 'integrations'
  | 'audit'
  | 'users'
  | 'poc'
  | 'visitors'
  | 'demoSessions'
  | 'reports'
  | 'monitoring'
  | 'security'
  | 'mobileQa'

export type ProcessStatus = 'Em análise' | 'Aguardando prazo' | 'Para assinatura' | 'Peticionado' | 'Suspenso'
export type Priority = 'Crítica' | 'Alta' | 'Normal'

export interface LegalProcess {
  id: string
  number: string
  title: string
  party: string
  area: string
  type: 'Judicial' | 'Administrativo' | 'Execução fiscal'
  status: ProcessStatus
  priority: Priority
  owner: string
  deadline: string
  value: number
  court: string
  followed: boolean
  movement: string
}

export interface DebtCertificate {
  id: string
  cda: string
  taxpayer: string
  principal: number
  updated: number
  prescription: string
  status: 'Elegível' | 'Em revisão' | 'Ajuizada' | 'REFIS'
  eligibleCnj: boolean
  selected?: boolean
}

export interface AuditEvent {
  id: string
  at: string
  actor: string
  action: string
  target: string
  source: 'Usuário' | 'Automação' | 'IA' | 'Integração'
  detail: string
}

export interface PocRequirement {
  ref: string
  title: string
  coverage: 'Demonstrável' | 'Simulado' | 'Roadmap'
  view: ViewId
  evidence: string
}

export interface Connector {
  name: string
  group: string
  mode: 'real' | 'convenio' | 'demo'
  tribunal?: string
  detail: string
  pending?: string
}

export interface Jurisprudence {
  ref: string
  holding: string
  scope: string
}

export interface AppUser {
  id: string
  username: string
  displayName: string
  role: 'guest' | 'presenter' | 'owner'
  active: boolean
  ssoOnly: boolean
  createdAt: string
}

export interface CourtOrder {
  id: string
  kind: 'Precatório' | 'RPV'
  number: string
  beneficiary: string
  value: number
  budgetYear: string
  status: 'Aguardando orçamento' | 'Em pagamento' | 'Quitado'
}

export interface WaitingBox {
  id: string
  process: string
  reason: string
  returnAt: string
  owner: string
}

export interface DatajudProcess {
  numeroProcesso: string
  tribunal: string
  grau: string
  classe: string | null
  assuntos: string[]
  orgaoJulgador: string | null
  sistema: string | null
  formato: string | null
  dataAjuizamento: string | null
  dataUltimaAtualizacao: string | null
  totalMovimentos: number
  ultimoMovimento: { nome: string | null; dataHora: string | null } | null
}
