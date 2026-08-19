import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Database,
  Download,
  FileCheck2,
  FileSearch,
  FileSignature,
  FileText,
  Filter,
  Fingerprint,
  GitBranch,
  History,
  KeyRound,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  LogOut,
  Menu,
  MonitorPlay,
  MonitorSmartphone,
  Network,
  PanelLeftClose,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { auditSeed, connectors, courtOrdersSeed, debtSeed, jurisprudenceSeed, money, pocRequirements, processesSeed, waitingBoxSeed } from './data'
import { DemoSessionsView, MobileValidationView, MonitoringView, ReportsView, SecurityView, VisitorsView, managementSessionSeed } from './demoManagement'
import { classifyLegalText, updateDebt, type ClassificationResult } from './lib/demoEngine'
import type { AppUser, AuditEvent, DatajudProcess, DebtCertificate, LegalProcess, ViewId, WaitingBox } from './types'

type IconType = typeof LayoutDashboard

const navItems: { id: ViewId; label: string; icon: IconType }[] = [
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'processes', label: 'Processos', icon: BriefcaseBusiness },
  { id: 'debt', label: 'Dívida ativa', icon: CircleDollarSign },
  { id: 'deadlines', label: 'Prazos', icon: CalendarClock },
  { id: 'petitions', label: 'Peticionamento', icon: FileSignature },
  { id: 'workflows', label: 'Fluxos', icon: GitBranch },
  { id: 'ai', label: 'IA jurídica', icon: Sparkles },
  { id: 'integrations', label: 'Integrações', icon: Network },
  { id: 'users', label: 'Cadastro e permissões', icon: Users },
  { id: 'audit', label: 'Auditoria', icon: History },
]

const managementNavItems: { id: ViewId; label: string; icon: IconType }[] = [
  { id: 'visitors', label: 'Visitantes', icon: Users },
  { id: 'demoSessions', label: 'Sessões individuais', icon: KeyRound },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'monitoring', label: 'Monitoramento', icon: Activity },
  { id: 'security', label: 'Segurança', icon: ShieldCheck },
  { id: 'mobileQa', label: 'Validação mobile', icon: MonitorSmartphone },
]

const titles: Record<ViewId, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: 'Operação jurídica', title: 'Bom trabalho, Helena.', description: 'O que exige decisão hoje, em uma única visão.' },
  processes: { eyebrow: 'Contencioso e administrativo', title: 'Processos', description: 'Histórico, responsáveis, documentos e próximos movimentos.' },
  debt: { eyebrow: 'Recuperação de receita', title: 'Dívida ativa', description: 'Da inscrição ao ajuizamento, com critérios revisáveis.' },
  deadlines: { eyebrow: 'Controle operacional', title: 'Prazos e expedientes', description: 'Prioridades calculadas, alertas e distribuição de carga.' },
  petitions: { eyebrow: 'Produção jurídica', title: 'Central de peticionamento', description: 'Valide, assine e protocole documentos individuais ou em lote.' },
  workflows: { eyebrow: 'Automação', title: 'Fluxos de trabalho', description: 'Etapas claras, responsáveis e intervenção humana nos pontos críticos.' },
  ai: { eyebrow: 'Inteligência assistiva', title: 'Triagem jurídica com IA', description: 'Classificação explicável, rastreável e sempre sujeita à validação.' },
  integrations: { eyebrow: 'Interoperabilidade', title: 'Central de integrações', description: 'Contratos de dados, sincronização e saúde dos conectores.' },
  audit: { eyebrow: 'Governança', title: 'Trilha de auditoria', description: 'Cada ação humana ou automatizada registrada para fiscalização.' },
  users: { eyebrow: 'Controle de acesso', title: 'Cadastro e permissões', description: 'Usuários reais, senha própria, perfis e situação de cada conta.' },
  poc: { eyebrow: 'Pregão Eletrônico 110/2026', title: 'Cockpit da prova de conceito', description: 'Matriz navegável dos requisitos essenciais do item 12.7.' },
  visitors: { eyebrow: 'Inteligência da demonstração', title: 'Visitantes', description: 'Acessos, interesse e comportamento com privacidade preservada.' },
  demoSessions: { eyebrow: 'Experiência individual', title: 'Sessões de demonstração', description: 'Organize convites, validade e atividade por interessado.' },
  reports: { eyebrow: 'Evidências', title: 'Relatórios pós-apresentação', description: 'Transforme a sessão em um entregável comercial e técnico.' },
  monitoring: { eyebrow: 'Confiabilidade', title: 'Monitoramento operacional', description: 'Aplicação, banco, portal e alertas em uma única leitura.' },
  security: { eyebrow: 'Proteção', title: 'Segurança da demonstração', description: 'Controles ativos, segredos protegidos e próximas camadas.' },
  mobileQa: { eyebrow: 'Qualidade', title: 'Validação mobile', description: 'Matriz responsiva com evidência automatizada e inspeção física.' },
}

const sourceIcon: Record<AuditEvent['source'], IconType> = {
  Usuário: UserCheck,
  Automação: Zap,
  IA: Bot,
  Integração: Network,
}

const demoText = `INTIMAÇÃO FICTÍCIA — EXECUÇÃO FISCAL
Processo nº 1008421-42.2026.8.26.0664. O Município é intimado para se manifestar, no prazo de 15 dias, sobre o parcelamento da dívida ativa representada pela CDA 2026-01842, referente a IPTU. O débito possui pagamento parcial e requer atualização do saldo.`

function App() {
  const [view, setView] = useState<ViewId>('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [processes, setProcesses] = useState(processesSeed)
  const [debts, setDebts] = useState(debtSeed)
  const [audit, setAudit] = useState(auditSeed)
  const [toast, setToast] = useState<string | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<LegalProcess | null>(null)
  const [presentationStep, setPresentationStep] = useState<number | null>(null)
  const [demoSessions, setDemoSessions] = useState(managementSessionSeed)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((current) => !current)
      }
      if (event.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    void fetch(`${import.meta.env.BASE_URL}api/access/page-view`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `/${view}` }),
    }).then((response) => {
      if (response.status === 401) window.location.assign(import.meta.env.BASE_URL)
    })
  }, [view])

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.BASE_URL}api/auth/logout`, {
        method: 'POST',
        credentials: 'same-origin',
      })
    } finally {
      // replace() não deixa a página autenticada no histórico do navegador.
      window.location.replace(import.meta.env.BASE_URL)
    }
  }

  useEffect(() => {
    // Se o navegador restaurar a página do bfcache (botão Voltar após sair),
    // revalida a sessão e volta ao login quando ela não existe mais.
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      void fetch(`${import.meta.env.BASE_URL}api/auth/session`, { credentials: 'same-origin' })
        .then((response) => {
          if (response.status === 401) window.location.replace(import.meta.env.BASE_URL)
        })
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  const navigate = (target: ViewId) => {
    setView(target)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addAudit = (action: string, target: string, source: AuditEvent['source'], detail: string, actor = 'Dra. Helena Prado') => {
    const event: AuditEvent = {
      id: `aud-${Date.now()}`,
      at: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()),
      actor,
      action,
      target,
      source,
      detail,
    }
    setAudit((current) => [event, ...current])
  }

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3200)
  }

  const showPresentationStep = (step: number) => {
    const normalized = Math.max(0, Math.min(pocRequirements.length - 1, step))
    setPresentationStep(normalized)
    navigate(pocRequirements[normalized].view)
  }

  const startPresentation = () => {
    showPresentationStep(0)
    addAudit('Modo apresentação iniciado', 'Roteiro POC', 'Usuário', 'Jornada guiada pelos dez requisitos iniciada.')
    notify('Modo apresentação iniciado. Use o guia inferior para avançar.')
  }

  const finishPresentation = () => {
    setPresentationStep(null)
    addAudit('Modo apresentação concluído', 'Roteiro POC', 'Usuário', 'Jornada guiada encerrada pelo apresentador.')
    notify('Apresentação encerrada e registrada na auditoria.')
  }

  const resetDemo = () => {
    setProcesses(processesSeed.map((item) => ({ ...item })))
    setDebts(debtSeed.map((item) => ({ ...item })))
    setAudit(auditSeed.map((item) => ({ ...item })))
    setDemoSessions(managementSessionSeed.map((item) => ({ ...item })))
    setSelectedProcess(null)
    notify('Dados fictícios restaurados para o início da apresentação.')
  }

  const header = titles[view]

  return (
    <div className={`app-shell ${presentationStep !== null ? 'presentation-active' : ''}`}>
      <Sidebar view={view} menuOpen={menuOpen} onNavigate={navigate} onClose={() => setMenuOpen(false)} />

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          <div className="topbar-spacer" />
          <button className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Buscar processo, CDA ou parte"><Search size={17} /><span>Buscar processo, CDA ou parte</span><kbd>⌘ K</kbd></button>
          <button className="icon-button notification-button" aria-label="Notificações"><Bell size={19} /><i /></button>
          <button className="user-pill" onClick={() => navigate('poc')}><span>HP</span><div><strong>Helena Prado</strong><small>Procuradora</small></div></button>
          <button className="icon-button" onClick={logout} aria-label="Sair da demonstração" title="Sair"><LogOut size={18} /></button>
        </header>

        <div className="content-wrap">
          <section className="page-heading">
            <div>
              <p className="eyebrow">{header.eyebrow}</p>
              <h1>{header.title}</h1>
              <p>{header.description}</p>
            </div>
            <div className="heading-actions">
              <span className="environment-badge"><span /> Ambiente demonstrativo</span>
              <button className="secondary-button presentation-trigger" onClick={presentationStep === null ? startPresentation : finishPresentation}><MonitorPlay size={17} /> {presentationStep === null ? 'Modo apresentação' : 'Encerrar apresentação'}</button>
              {view !== 'poc' && <button className="secondary-button" onClick={() => navigate('poc')}><ListChecks size={17} /> Ver cobertura POC</button>}
            </div>
          </section>

          {view === 'overview' && <Overview processes={processes} audit={audit} onNavigate={navigate} onSelect={setSelectedProcess} />}
          {view === 'processes' && <ProcessesView processes={processes} onSelect={setSelectedProcess} onFollow={(id) => {
            setProcesses((current) => current.map((item) => item.id === id ? { ...item, followed: !item.followed } : item))
            addAudit('Acompanhamento alterado', id, 'Usuário', 'Preferência de notificação por e-mail atualizada.')
            notify('Acompanhamento atualizado e registrado na auditoria.')
          }} onCreate={(process) => {
            setProcesses((current) => [process, ...current])
            addAudit('Processo cadastrado', process.number, 'Usuário', 'Cadastro inteligente concluído após verificação de litispendência.')
            notify('Processo cadastrado com verificação de litispendência registrada.')
          }} onAudit={addAudit} />}
          {view === 'debt' && <DebtView debts={debts} setDebts={setDebts} onAudit={addAudit} notify={notify} />}
          {view === 'deadlines' && <DeadlinesView processes={processes} setProcesses={setProcesses} onAudit={addAudit} notify={notify} />}
          {view === 'petitions' && <PetitionsView processes={processes} setProcesses={setProcesses} onAudit={addAudit} notify={notify} />}
          {view === 'workflows' && <WorkflowsView onAudit={addAudit} notify={notify} />}
          {view === 'ai' && <AiView onAudit={addAudit} notify={notify} />}
          {view === 'integrations' && <IntegrationsView onAudit={addAudit} notify={notify} />}
          {view === 'audit' && <AuditView events={audit} notify={notify} />}
          {view === 'users' && <UsersView onAudit={addAudit} notify={notify} />}
          {view === 'poc' && <PocView onNavigate={navigate} auditCount={audit.length} />}
          {view === 'visitors' && <VisitorsView />}
          {view === 'demoSessions' && <DemoSessionsView sessions={demoSessions} setSessions={setDemoSessions} notify={notify} />}
          {view === 'reports' && <ReportsView audit={audit} notify={notify} />}
          {view === 'monitoring' && <MonitoringView />}
          {view === 'security' && <SecurityView />}
          {view === 'mobileQa' && <MobileValidationView notify={notify} />}
        </div>
      </main>

      {presentationStep !== null && <PresentationDock
        step={presentationStep}
        onPrevious={() => showPresentationStep(presentationStep - 1)}
        onNext={() => presentationStep === pocRequirements.length - 1 ? finishPresentation() : showPresentationStep(presentationStep + 1)}
        onReset={resetDemo}
        onClose={finishPresentation}
      />}
      {searchOpen && <GlobalSearch
        processes={processes}
        debts={debts}
        onClose={() => setSearchOpen(false)}
        onOpenProcess={(process) => { setSearchOpen(false); setSelectedProcess(process) }}
        onOpenDebts={() => { setSearchOpen(false); navigate('debt') }}
        onAudit={addAudit}
      />}
      {selectedProcess && <ProcessDrawer process={selectedProcess} onClose={() => setSelectedProcess(null)} />}
      {toast && <div className="toast"><CheckCircle2 size={19} /><span>{toast}</span></div>}
    </div>
  )
}

function PresentationDock({ step, onPrevious, onNext, onReset, onClose }: { step: number; onPrevious: () => void; onNext: () => void; onReset: () => void; onClose: () => void }) {
  const requirement = pocRequirements[step]
  const lastStep = step === pocRequirements.length - 1

  return (
    <section className="presentation-dock" aria-label="Guia do modo apresentação" aria-live="polite">
      <div className="presentation-progress"><span style={{ width: `${((step + 1) / pocRequirements.length) * 100}%` }} /></div>
      <div className="presentation-content">
        <button className="presentation-icon-button" onClick={onPrevious} disabled={step === 0} aria-label="Requisito anterior"><ChevronLeft size={20} /></button>
        <div className="presentation-copy">
          <small>Passo {step + 1} de {pocRequirements.length} · {requirement.ref}</small>
          <strong>{requirement.title}</strong>
          <span>{requirement.evidence}</span>
        </div>
        <div className="presentation-actions">
          <button className="presentation-reset" onClick={onReset} aria-label="Restaurar dados da demonstração"><RotateCcw size={16} /> <span>Restaurar demo</span></button>
          <button className="presentation-next" onClick={onNext}>{lastStep ? 'Concluir' : 'Próximo'} {!lastStep && <ChevronRight size={18} />}</button>
          <button className="presentation-close" onClick={onClose} aria-label="Encerrar apresentação"><X size={18} /></button>
        </div>
      </div>
    </section>
  )
}

function Sidebar({ view, menuOpen, onNavigate, onClose }: { view: ViewId; menuOpen: boolean; onNavigate: (id: ViewId) => void; onClose: () => void }) {
  return (
    <>
      {menuOpen && <button className="sidebar-scrim" onClick={onClose} aria-label="Fechar menu" />}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Scale size={21} /></div><div><strong>JurisFlow</strong><small>Municipal</small></div><button className="icon-button sidebar-close" onClick={onClose} aria-label="Fechar menu"><PanelLeftClose size={19} /></button></div>
        <div className="workspace-switch"><Landmark size={17} /><div><small>Órgão</small><strong>PGM Demonstração</strong></div><ChevronRight size={16} /></div>
        <nav>
          <p className="nav-label">Operação</p>
          {navItems.map((item) => {
            const Icon = item.icon
            return <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}><Icon size={18} /><span>{item.label}</span>{item.id === 'deadlines' && <em>3</em>}</button>
          })}
          <p className="nav-label management-label">Demonstração</p>
          {managementNavItems.map((item) => {
            const Icon = item.icon
            return <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}><Icon size={18} /><span>{item.label}</span></button>
          })}
        </nav>
        <div className="sidebar-footer">
          <button className={`poc-card ${view === 'poc' ? 'active' : ''}`} onClick={() => onNavigate('poc')}>
            <div><ShieldCheck size={18} /><span>Prontidão POC</span></div>
            <strong>{pocRequirements.length} referências mapeadas</strong>
            <div className="mini-progress"><span style={{ width: `${(pocRequirements.filter((item) => item.coverage === 'Demonstrável').length / pocRequirements.length) * 100}%` }} /></div>
            <small>{pocRequirements.filter((item) => item.coverage === 'Demonstrável').length} demonstráveis · {pocRequirements.filter((item) => item.coverage !== 'Demonstrável').length} pendentes</small>
          </button>
          <div className="security-note"><LockKeyhole size={16} /><span>Dados 100% fictícios<br /><small>Sessão pública segura</small></span></div>
        </div>
      </aside>
    </>
  )
}

function Overview({ processes, audit, onNavigate, onSelect }: { processes: LegalProcess[]; audit: AuditEvent[]; onNavigate: (id: ViewId) => void; onSelect: (item: LegalProcess) => void }) {
  const totalValue = processes.reduce((sum, item) => sum + item.value, 0)
  return (
    <div className="stack-lg">
      <section className="metric-strip">
        <Metric label="Prazos em 48 horas" value="3" trend="1 crítico" tone="danger" icon={Clock3} />
        <Metric label="Carteira ativa" value="1.284" trend="+38 neste mês" icon={BriefcaseBusiness} />
        <Metric label="Valor monitorado" value={money(totalValue)} trend="dados da amostra" icon={CircleDollarSign} />
        <Metric label="Automações hoje" value="186" trend="99,2% sem intervenção" tone="success" icon={Zap} />
      </section>

      <section className="operations-grid">
        <div className="panel priority-panel">
          <div className="panel-heading"><div><p className="section-kicker">Foco imediato</p><h2>Fila de decisão</h2></div><button className="text-button" onClick={() => onNavigate('deadlines')}>Ver todos <ArrowRight size={15} /></button></div>
          <div className="decision-list">
            {processes.slice(0, 3).map((process, index) => (
              <button className="decision-row" key={process.id} onClick={() => onSelect(process)}>
                <div className={`priority-index ${index === 0 ? 'critical' : ''}`}>{index + 1}</div>
                <div className="decision-main"><div><span className={`status-dot ${process.priority.toLowerCase().replace('í', 'i')}`} />{process.title}</div><small>{process.number} · {process.owner}</small></div>
                <div className="decision-time"><strong>{process.deadline}</strong><small>{process.status}</small></div>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </div>

        <div className="panel recovery-panel">
          <div className="panel-heading"><div><p className="section-kicker">Execução fiscal</p><h2>Este mês</h2></div><span className="small-badge success">+12,8%</span></div>
          <div className="recovery-value"><strong>R$ 1,84 mi</strong><span>recuperados</span></div>
          <div className="bar-chart" aria-label="Arrecadação dos últimos seis meses">
            {[44, 52, 47, 69, 61, 82].map((height, index) => <div key={index} className={index === 5 ? 'current' : ''}><span style={{ height: `${height}%` }} /><small>{['mar', 'abr', 'mai', 'jun', 'jul', 'ago'][index]}</small></div>)}
          </div>
          <button className="secondary-button full" onClick={() => onNavigate('debt')}>Abrir carteira de dívida <ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="operations-grid lower-grid">
        <div className="panel pipeline-panel">
          <div className="panel-heading"><div><p className="section-kicker">Visão operacional</p><h2>Pipeline de processos</h2></div><button className="icon-button"><Filter size={17} /></button></div>
          <div className="pipeline">
            {[
              ['Entrada e triagem', '84', 74], ['Em análise', '47', 57], ['Aguardando terceiro', '31', 43], ['Para assinatura', '18', 31], ['Peticionado', '126', 88],
            ].map(([label, value, width]) => <div key={label as string}><div><span>{label}</span><strong>{value}</strong></div><div className="pipeline-track"><span style={{ width: `${width}%` }} /></div></div>)}
          </div>
        </div>

        <div className="panel activity-panel">
          <div className="panel-heading"><div><p className="section-kicker">Rastreabilidade</p><h2>Atividade recente</h2></div><button className="text-button" onClick={() => onNavigate('audit')}>Auditoria <ArrowRight size={15} /></button></div>
          <div className="activity-list">
            {audit.slice(0, 4).map((event) => {
              const Icon = sourceIcon[event.source]
              return <div className="activity-row" key={event.id}><span className={`activity-icon source-${event.source.toLowerCase()}`}><Icon size={15} /></span><div><strong>{event.action}</strong><small>{event.actor} · {event.at}</small></div></div>
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value, trend, icon: Icon, tone }: { label: string; value: string; trend: string; icon: IconType; tone?: string }) {
  return <div className={`metric ${tone ?? ''}`}><span className="metric-icon"><Icon size={19} /></span><div><p>{label}</p><strong>{value}</strong><small>{trend}</small></div></div>
}

function NewProcessModal({ processes, onClose, onCreate, onAudit }: { processes: LegalProcess[]; onClose: () => void; onCreate: (process: LegalProcess) => void; onAudit: (action: string, target: string, source: AuditEvent['source'], detail: string, actor?: string) => void }) {
  const [form, setForm] = useState({ number: '', title: '', party: '', area: 'Tributário', type: 'Execução fiscal' as LegalProcess['type'], court: 'TJSP' })
  const [checked, setChecked] = useState<{ duplicates: LegalProcess[]; related: LegalProcess[]; datajud?: DatajudProcess | null; datajudError?: string } | null>(null)
  const [checking, setChecking] = useState(false)

  const digits = form.number.replace(/\D/g, '')
  const runCheck = async () => {
    setChecking(true)
    const normalizedNumber = digits
    const duplicates = processes.filter((item) => item.number.replace(/\D/g, '') === normalizedNumber && normalizedNumber.length > 0)
    const partyKey = form.party.trim().toLowerCase().split('—')[0].trim()
    const related = processes.filter((item) => partyKey.length > 3 && item.party.toLowerCase().includes(partyKey) && item.number.replace(/\D/g, '') !== normalizedNumber)
    let datajud: DatajudProcess | null | undefined
    let datajudError: string | undefined
    if (digits.length === 20 && datajudTribunals.includes(form.court)) {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}api/integrations/datajud/process`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tribunal: form.court, number: digits }),
        })
        const payload = await response.json()
        datajud = response.ok ? payload.process : null
        if (!response.ok && response.status !== 404) datajudError = payload.error
      } catch {
        datajudError = 'Consulta ao tribunal indisponível no momento.'
      }
    }
    setChecked({ duplicates, related, datajud, datajudError })
    onAudit('Verificação de litispendência executada', form.number || '(sem número)', 'Automação', `${duplicates.length} duplicidade(s) na base, ${related.length} processo(s) conexo(s) por parte${datajud ? '; processo confirmado no tribunal via DataJud' : ''}.`, 'Cadastro inteligente')
    setChecking(false)
  }

  const create = () => {
    onCreate({
      id: `proc-${Date.now()}`,
      number: form.number.trim(),
      title: form.title.trim(),
      party: `${form.party.trim()} (fictício)`,
      area: form.area,
      type: form.type,
      status: 'Em análise',
      priority: 'Normal',
      owner: 'Dra. Helena Prado',
      deadline: 'A distribuir',
      value: 0,
      court: form.court,
      followed: false,
      movement: checked?.datajud ? `Cadastro validado no ${form.court} via DataJud: ${checked.datajud.classe ?? 'classe não informada'}` : 'Processo cadastrado manualmente com verificação de litispendência',
    })
    onClose()
  }

  const blocked = Boolean(checked?.duplicates.length)
  const canSubmit = form.number.trim().length >= 5 && form.title.trim().length >= 5 && form.party.trim().length >= 3
  return <div className="drawer-layer search-layer">
    <button className="drawer-scrim" onClick={onClose} aria-label="Fechar cadastro" />
    <section className="search-modal new-process-modal" role="dialog" aria-label="Novo processo">
      <div className="panel-heading modal-heading"><div><p className="section-kicker">Cadastro inteligente · item 6.4.21</p><h2>Novo processo</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div>
      <div className="user-form modal-form">
        <label>Número do processo<input value={form.number} onChange={(e) => { setForm({ ...form, number: e.target.value }); setChecked(null) }} placeholder="0000000-00.0000.0.00.0000" /></label>
        <label>Assunto<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Execução fiscal — IPTU 2025" /></label>
        <label>Parte e papel processual<input value={form.party} onChange={(e) => { setForm({ ...form, party: e.target.value }); setChecked(null) }} placeholder="Empresa Exemplo Ltda. — Executada" /></label>
        <div className="form-row">
          <label>Matéria<select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>{['Tributário', 'Cível', 'Trabalhista', 'Administrativo'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LegalProcess['type'] })}>{['Execução fiscal', 'Judicial', 'Administrativo'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Órgão<select value={form.court} onChange={(e) => { setForm({ ...form, court: e.target.value }); setChecked(null) }}>{[...datajudTribunals, '1DOC', 'SEI'].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        {checked && <div className={`litis-result ${blocked ? 'blocked' : ''}`}>
          {blocked
            ? <p><AlertTriangle size={15} /> <strong>Litispendência:</strong> o número já está cadastrado ({checked.duplicates[0].title}). O cadastro em duplicidade está bloqueado.</p>
            : <p><CheckCircle2 size={15} /> Nenhuma duplicidade pelo número na base.</p>}
          {checked.related.length > 0 && <p><FileSearch size={15} /> {checked.related.length} processo(s) da mesma parte para conferência de conexão: {checked.related.map((item) => item.number).join(', ')}.</p>}
          {checked.datajud && <p><BadgeCheck size={15} /> Processo confirmado no {form.court} (DataJud): {checked.datajud.classe ?? '—'} · {checked.datajud.orgaoJulgador ?? '—'}.</p>}
          {checked.datajud === null && !checked.datajudError && <p><AlertTriangle size={15} /> Número não localizado no índice público do {form.court} — confirme antes de prosseguir.</p>}
          {checked.datajudError && <p><AlertTriangle size={15} /> {checked.datajudError}</p>}
        </div>}
        <div className="modal-actions">
          <button className="secondary-button" disabled={!canSubmit || checking} onClick={() => void runCheck()}>{checking ? <RefreshCw className="spin" size={16} /> : <FileSearch size={16} />} Verificar litispendência</button>
          <button className="primary-button" disabled={!canSubmit || !checked || blocked} onClick={create} title={!checked ? 'Execute a verificação antes de cadastrar' : undefined}><Plus size={16} /> Cadastrar processo</button>
        </div>
        {!checked && <p className="search-hint">A verificação de litispendência (base local + consulta real ao tribunal quando aplicável) é obrigatória antes do cadastro.</p>}
      </div>
    </section>
  </div>
}

function ProcessesView({ processes, onSelect, onFollow, onCreate, onAudit }: { processes: LegalProcess[]; onSelect: (item: LegalProcess) => void; onFollow: (id: string) => void; onCreate: (process: LegalProcess) => void; onAudit: (action: string, target: string, source: AuditEvent['source'], detail: string, actor?: string) => void }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [creating, setCreating] = useState(false)
  const filtered = processes.filter((item) => (filter === 'Todos' || item.type === filter) && `${item.number} ${item.title} ${item.party}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <section className="panel table-panel">
      {creating && <NewProcessModal processes={processes} onClose={() => setCreating(false)} onCreate={onCreate} onAudit={onAudit} />}
      <div className="toolbar"><div className="search-input"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Número, parte ou assunto…" /></div><div className="segmented">{['Todos', 'Judicial', 'Administrativo', 'Execução fiscal'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><button className="primary-button" onClick={() => setCreating(true)}><Plus size={17} /> Novo processo</button></div>
      <div className="table-scroll"><table className="responsive-table process-table"><thead><tr><th>Processo / assunto</th><th>Responsável</th><th>Prazo</th><th>Status</th><th>Acompanhar</th><th /></tr></thead><tbody>{filtered.map((process) => <tr key={process.id}><td className="mobile-card-title"><button className="table-primary" onClick={() => onSelect(process)}><strong>{process.title}</strong><small>{process.number} · {process.party}</small></button></td><td data-label="Responsável"><span className="owner-cell"><i>{initials(process.owner)}</i>{process.owner}</span></td><td data-label="Prazo"><span className={process.priority === 'Crítica' ? 'critical-text' : ''}>{process.deadline}</span></td><td data-label="Status"><StatusBadge value={process.status} /></td><td data-label="Acompanhamento"><button className={`follow-button ${process.followed ? 'active' : ''}`} onClick={() => onFollow(process.id)}><Bell size={16} /> {process.followed ? 'Ativo' : 'Ativar'}</button></td><td className="mobile-card-action"><button className="icon-button" onClick={() => onSelect(process)} aria-label={`Abrir ${process.title}`}><ChevronRight size={17} /></button></td></tr>)}</tbody></table></div>
      <div className="table-footer"><span>{filtered.length} de {processes.length} processos da amostra</span><span>Dados fictícios para demonstração pública</span></div>
    </section>
  )
}

function DebtView({ debts, setDebts, onAudit, notify }: { debts: DebtCertificate[]; setDebts: React.Dispatch<React.SetStateAction<DebtCertificate[]>>; onAudit: (action: string, target: string, source: AuditEvent['source'], detail: string, actor?: string) => void; notify: (message: string) => void }) {
  const selected = debts.filter((item) => item.selected)
  const toggle = (id: string) => setDebts((current) => current.map((item) => item.id === id ? { ...item, selected: !item.selected } : item))
  const updateValues = () => {
    setDebts((current) => current.map((item) => item.selected ? { ...item, updated: updateDebt(item.principal, 1, 2, 3) } : item))
    onAudit('Valores atualizados em lote', `${selected.length} CDAs`, 'Automação', 'Padrão demonstrativo: juros simples de 1% a.m., multa de 2%, período de 3 meses.', 'Motor de cálculo')
    notify(`${selected.length} CDA(s) atualizada(s) com memória de cálculo.`)
  }
  const createBatch = () => {
    setDebts((current) => current.map((item) => item.selected ? { ...item, status: 'Ajuizada', selected: false } : item))
    onAudit('Lote de ajuizamento criado', `Lote CDA-${Date.now().toString().slice(-6)}`, 'Automação', `${selected.length} processos, minutas e tarefas de assinatura gerados.`, 'Orquestrador fiscal')
    notify('Lote formado e enviado para validação jurídica.')
  }
  const [sweepResult, setSweepResult] = useState<DebtCertificate[] | null>(null)
  const runSweep = () => {
    const eligible = debts.filter((item) => item.eligibleCnj)
    setSweepResult(eligible)
    onAudit('Varredura de extinção/suspensão concluída', `${eligible.length} propostas`, 'Automação', 'Fundamentos aplicados: STF Tema 1184 (RE 1.355.208), Resolução CNJ 547/2024, Súmulas 452 e 409 do STJ. Critérios: baixo valor, ausência de movimento útil e situação da citação.', 'Robô de execução fiscal')
    notify(`${eligible.length} processos sinalizados com fundamento jurídico; nenhuma ação sem validação.`)
  }
  return <div className="stack-lg">
    <section className="metric-strip compact"><Metric label="Saldo da amostra" value={money(debts.reduce((s, i) => s + i.updated, 0))} trend="4 inscrições" icon={Database} /><Metric label="Próximas da prescrição" value="1" trend="até 120 dias" tone="danger" icon={AlertTriangle} /><Metric label="Elegíveis à triagem CNJ" value={String(debts.filter((i) => i.eligibleCnj).length)} trend="revisão obrigatória" icon={FileSearch} /><Metric label="Em REFIS" value="1" trend="regra 2026 ativa" tone="success" icon={BadgeCheck} /></section>
    <section className="panel table-panel">
      <div className="toolbar"><div><p className="section-kicker">Carteira fiscal</p><h2>Certidões de Dívida Ativa</h2></div><div className="toolbar-actions"><button className="secondary-button" onClick={runSweep}><RefreshCw size={16} /> Varredura CNJ</button><button disabled={!selected.length} className="secondary-button" onClick={updateValues}><CircleDollarSign size={16} /> Atualizar saldo</button><button disabled={!selected.length} className="primary-button" onClick={createBatch}><FileCheck2 size={16} /> Ajuizar {selected.length ? `(${selected.length})` : ''}</button></div></div>
      <div className="table-scroll"><table className="responsive-table debt-table"><thead><tr><th className="check-col"><input type="checkbox" aria-label="Selecionar todas" checked={selected.length === debts.length} onChange={() => setDebts((current) => current.map((item) => ({ ...item, selected: selected.length !== debts.length })))} /></th><th>CDA / contribuinte</th><th>Principal</th><th>Atualizado</th><th>Prescrição</th><th>Situação</th></tr></thead><tbody>{debts.map((item) => <tr key={item.id} className={item.selected ? 'selected-row' : ''}><td className="mobile-card-select"><input type="checkbox" checked={Boolean(item.selected)} onChange={() => toggle(item.id)} aria-label={`Selecionar ${item.cda}`} /></td><td className="mobile-card-title"><span className="table-primary"><strong>{item.cda}</strong><small>{item.taxpayer}</small></span></td><td data-label="Principal">{money(item.principal)}</td><td data-label="Atualizado"><strong>{money(item.updated)}</strong></td><td data-label="Prescrição">{item.prescription}{item.eligibleCnj && <small className="inline-alert">Triagem CNJ</small>}</td><td data-label="Situação"><StatusBadge value={item.status} /></td></tr>)}</tbody></table></div>
      <div className="batch-bar"><div><CheckCircle2 size={18} /><span><strong>{selected.length}</strong> selecionada(s)</span></div><span>A formação do lote gera processos, minutas, tarefas e trilha de auditoria.</span></div>
    </section>
    {sweepResult && <section className="panel sweep-panel">
      <div className="panel-heading"><div><p className="section-kicker">REF-09 · Extinção ou suspensão automática</p><h2>Propostas da varredura, com fundamento</h2></div><button className="icon-button" onClick={() => setSweepResult(null)} aria-label="Fechar propostas"><X size={17} /></button></div>
      <div className="sweep-grid">
        <div className="sweep-proposals">
          {sweepResult.length ? sweepResult.map((item) => <article className="sweep-proposal" key={item.id}>
            <div><strong>{item.cda}</strong><small>{item.taxpayer} · saldo {money(item.updated)}</small></div>
            <p>{item.updated < 10_000 ? 'Proposta: extinção — valor inferior a R$ 10 mil sem movimentação útil (Resolução CNJ 547/2024; STF Tema 1184).' : 'Proposta: suspensão — a extinção de valores maiores é faculdade do ente credor (Súmula 452/STJ).'}</p>
            <button className="secondary-button" onClick={() => { onAudit(item.updated < 10_000 ? 'Extinção aprovada pela procuradoria' : 'Suspensão aprovada pela procuradoria', item.cda, 'Usuário', 'Proposta da varredura validada por decisão humana; minuta gerada para assinatura.'); notify(`Proposta da ${item.cda} aprovada e registrada na auditoria.`) }}><Check size={15} /> Aprovar proposta</button>
          </article>) : <EmptyState icon={FileSearch} title="Nenhuma proposta" text="Nenhuma CDA da amostra atende aos critérios de extinção ou suspensão." />}
        </div>
        <div className="sweep-basis">
          <p className="section-kicker">Fundamentação</p>
          {jurisprudenceSeed.map((item) => <div className="basis-row" key={item.ref}><Scale size={15} /><div><strong>{item.ref}</strong><span className="small-badge">{item.scope}</span><p>{item.holding}</p></div></div>)}
        </div>
      </div>
    </section>}
    <section className="panel table-panel">
      <div className="toolbar"><div><p className="section-kicker">Execuções contra a Fazenda · item 6.4.38-I</p><h2>Precatórios e RPVs</h2></div><span className="small-badge">{courtOrdersSeed.length} registros da amostra</span></div>
      <div className="table-scroll"><table className="responsive-table"><thead><tr><th>Requisitório / beneficiário</th><th>Tipo</th><th>Valor</th><th>Orçamento</th><th>Situação</th></tr></thead><tbody>
        {courtOrdersSeed.map((order) => <tr key={order.id}>
          <td className="mobile-card-title"><span className="table-primary"><strong>{order.number}</strong><small>{order.beneficiary}</small></span></td>
          <td data-label="Tipo"><span className="small-badge">{order.kind}</span></td>
          <td data-label="Valor">{money(order.value)}</td>
          <td data-label="Orçamento">{order.budgetYear}</td>
          <td data-label="Situação"><StatusBadge value={order.status} /></td>
        </tr>)}
      </tbody></table></div>
      <div className="table-footer"><span>Controle de requisitórios integrado à carteira de execução fiscal.</span><span>Dados fictícios para demonstração pública</span></div>
    </section>
  </div>
}

function DeadlinesView({ processes, setProcesses, onAudit, notify }: { processes: LegalProcess[]; setProcesses: React.Dispatch<React.SetStateAction<LegalProcess[]>>; onAudit: (action: string, target: string, source: AuditEvent['source'], detail: string, actor?: string) => void; notify: (message: string) => void }) {
  const conclude = (process: LegalProcess) => {
    setProcesses((current) => current.map((item) => item.id === process.id ? { ...item, status: 'Para assinatura', movement: 'Prazo tratado e minuta encaminhada para assinatura' } : item))
    onAudit('Prazo tratado', process.number, 'Usuário', 'Expediente conferido e encaminhado à etapa de assinatura.')
    notify('Prazo tratado; próxima tarefa criada automaticamente.')
  }
  return <section className="deadline-board">
    {[
      { label: 'Críticos', tone: 'red', items: processes.filter((item) => item.priority === 'Crítica') },
      { label: 'Próximas 48 horas', tone: 'amber', items: processes.filter((item) => item.priority === 'Alta') },
      { label: 'Programados', tone: 'blue', items: processes.filter((item) => item.priority === 'Normal') },
    ].map((column) => <div className="deadline-column" key={column.label}><div className="column-title"><span className={column.tone} /><strong>{column.label}</strong><em>{column.items.length}</em></div>{column.items.map((item) => <article className="deadline-card" key={item.id}><div className="card-meta"><span>{item.court}</span><span>{item.area}</span></div><h3>{item.title}</h3><p>{item.number}</p><div className="deadline-owner"><i>{initials(item.owner)}</i><span>{item.owner}</span></div><div className="deadline-footer"><strong><Clock3 size={15} /> {item.deadline}</strong><button onClick={() => conclude(item)}><Check size={16} /> Tratar</button></div></article>)}</div>)}
  </section>
}

interface CertificateInfo { subject: string | null; organization: string | null; issuer: string; serialNumber: string; notBefore: string; notAfter: string; icpBrasil: boolean; test: boolean; uploaded: boolean; expired: boolean; algorithm: string }

function PetitionsView({ processes, setProcesses, onAudit, notify }: { processes: LegalProcess[]; setProcesses: React.Dispatch<React.SetStateAction<LegalProcess[]>>; onAudit: (action: string, target: string, source: AuditEvent['source'], detail: string, actor?: string) => void; notify: (message: string) => void }) {
  const signable = processes.filter((item) => item.status === 'Para assinatura')
  const [selected, setSelected] = useState<string[]>(signable.map((item) => item.id))
  const [signing, setSigning] = useState(false)
  const [certificate, setCertificate] = useState<{ mode: string; a3Ready: boolean; certificate: CertificateInfo } | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [certPassword, setCertPassword] = useState('')
  const [certBusy, setCertBusy] = useState(false)

  const loadCertificate = () => fetch(`${import.meta.env.BASE_URL}api/sign/certificate`, { credentials: 'same-origin' })
    .then((response) => response.ok ? response.json() : null)
    .then(setCertificate)
    .catch(() => setCertificate(null))

  useEffect(() => {
    void loadCertificate()
    void fetch(`${import.meta.env.BASE_URL}api/auth/session`, { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => setRole(payload?.user?.role ?? null))
      .catch(() => setRole(null))
  }, [])

  const uploadCertificate = async () => {
    if (!certFile || !certPassword) return
    setCertBusy(true)
    try {
      const buffer = await certFile.arrayBuffer()
      const p12Base64 = btoa(Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join(''))
      const response = await fetch(`${import.meta.env.BASE_URL}api/sign/certificate/upload`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p12Base64, password: certPassword }),
      })
      const payload = await response.json()
      if (!response.ok) {
        notify(payload.error || 'Não foi possível instalar o certificado.')
        return
      }
      await loadCertificate()
      setCertFile(null)
      setCertPassword('')
      onAudit('Certificado digital instalado', payload.certificate.subject ?? 'certificado', 'Usuário', `${payload.certificate.issuer}${payload.certificate.icpBrasil ? ' (cadeia ICP-Brasil)' : ''}; válido até ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(payload.certificate.notAfter))}.`)
      notify(`Certificado de ${payload.certificate.subject} instalado; as próximas assinaturas já o utilizam.`)
    } finally {
      setCertBusy(false)
    }
  }

  const removeCertificate = async () => {
    setCertBusy(true)
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/sign/certificate`, { method: 'DELETE', credentials: 'same-origin' })
      const payload = await response.json()
      if (!response.ok) {
        notify(payload.error || 'Não foi possível remover o certificado.')
        return
      }
      await loadCertificate()
      onAudit('Certificado digital removido', 'certificado enviado', 'Usuário', 'O serviço voltou ao certificado configurado no ambiente.')
      notify('Certificado removido; o serviço voltou ao certificado do ambiente.')
    } finally {
      setCertBusy(false)
    }
  }

  const sign = async () => {
    const targets = processes.filter((item) => selected.includes(item.id))
    setSigning(true)
    try {
      for (const target of targets) {
        const response = await fetch(`${import.meta.env.BASE_URL}api/sign/petition`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ processNumber: target.number, title: target.title }),
        })
        if (!response.ok) {
          notify(`Falha ao assinar a petição de ${target.number}.`)
          continue
        }
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `peticao-${target.number.replace(/[^\d.-]/g, '')}-assinada.pdf`
        anchor.click()
        URL.revokeObjectURL(url)
        setProcesses((current) => current.map((item) => item.id === target.id ? { ...item, status: 'Peticionado', movement: 'Petição assinada digitalmente (PAdES) e disponível para protocolo' } : item))
        onAudit('Petição assinada digitalmente', target.number, 'Usuário', `PAdES real gerado no servidor; certificado ${certificate?.certificate.subject ?? 'configurado'} (${certificate?.certificate.icpBrasil ? 'cadeia ICP-Brasil' : 'cadeia de teste'}).`)
      }
      notify(`${targets.length} petição(ões) assinada(s); o PDF com assinatura embutida foi baixado.`)
      setSelected([])
    } finally {
      setSigning(false)
    }
  }

  const cert = certificate?.certificate
  return <div className="signing-layout">
    <section className="panel signing-main"><div className="panel-heading"><div><p className="section-kicker">Fila de documentos</p><h2>Prontos para validação</h2></div><span className="small-badge">{selected.length} selecionado(s)</span></div>
      <div className="document-list">{signable.length ? signable.map((item) => <label className="document-row" key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} /><span className="pdf-icon">PDF</span><div><strong>Petição — {item.title}</strong><small>{item.number} · modelo “Execução Fiscal v3”</small></div><span className="document-check"><FileCheck2 size={15} /> Validada</span></label>) : <EmptyState icon={FileCheck2} title="Fila concluída" text="Os documentos da amostra já percorreram o fluxo de assinatura." />}</div>
    </section>
    <aside className="panel certificate-panel"><div className="certificate-icon"><Fingerprint size={28} /></div><p className="section-kicker">Certificado digital</p><h2>{cert?.icpBrasil ? 'ICP-Brasil' : 'Assinatura PAdES'}</h2>
      <div className="certificate-data">
        <span><small>Titular</small><strong>{cert?.subject ?? 'carregando…'}</strong></span>
        <span><small>Emissor</small><strong>{cert?.issuer ?? '—'}</strong></span>
        <span><small>Validade</small><strong>{cert ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(cert.notAfter)) : '—'}</strong></span>
        <span><small>Algoritmo</small><strong>{cert?.algorithm ?? '—'}</strong></span>
      </div>
      {cert?.test && <div className="demo-warning"><AlertTriangle size={17} /><p><strong>Certificado de teste</strong>A assinatura CMS/PKCS#7 embutida no PDF é real; envie abaixo um e-CPF/e-CNPJ A1 (.pfx) para validade jurídica plena.</p></div>}
      {cert && !cert.test && cert.icpBrasil && <div className="human-note"><BadgeCheck size={17} /><p><strong>Cadeia ICP-Brasil ativa</strong>As assinaturas produzidas têm validade jurídica plena.</p></div>}
      {cert && !cert.test && !cert.icpBrasil && <div className="demo-warning"><AlertTriangle size={17} /><p><strong>Certificado fora da cadeia ICP-Brasil</strong>O certificado instalado é válido, mas o emissor não é uma AC ICP-Brasil.</p></div>}
      {certificate?.a3Ready && <div className="human-note"><KeyRound size={17} /><p><strong>Token A3 configurado</strong>Driver PKCS#11 carregado no servidor de assinatura.</p></div>}
      {role === 'owner' && <div className="cert-manager">
        <p className="section-kicker">Gerenciar certificado (A1)</p>
        <label className="cert-file-label">{certFile ? certFile.name : 'Escolher arquivo .pfx / .p12'}<input type="file" accept=".pfx,.p12,application/x-pkcs12" onChange={(e) => setCertFile(e.target.files?.[0] ?? null)} /></label>
        <input className="cert-pass-input" type="password" value={certPassword} onChange={(e) => setCertPassword(e.target.value)} placeholder="Senha do certificado" autoComplete="off" />
        <div className="cert-manager-actions">
          <button className="secondary-button" disabled={!certFile || !certPassword || certBusy} onClick={() => void uploadCertificate()}>{certBusy ? <RefreshCw className="spin" size={15} /> : <Fingerprint size={15} />} Instalar certificado</button>
          {cert?.uploaded && <button className="secondary-button" disabled={certBusy} onClick={() => void removeCertificate()}><X size={15} /> Remover</button>}
        </div>
        <p className="safe-copy">O arquivo fica no servidor com permissão restrita; a senha nunca é exibida. A instalação gera evento de auditoria.</p>
      </div>}
      <button disabled={!selected.length || signing} className="primary-button full" onClick={() => void sign()}>{signing ? <RefreshCw className="spin" size={17} /> : <KeyRound size={17} />} {selected.length > 1 ? `Assinar em lote (${selected.length}) — PAdES` : 'Assinar digitalmente (PAdES)'}</button>
      <p className="safe-copy">A assinatura é aplicada no servidor e o PDF assinado é baixado. Toda execução gera evento de auditoria.</p></aside>
  </div>
}

function WorkflowsView({ onAudit, notify }: { onAudit: (action: string, target: string, source: AuditEvent['source'], detail: string, actor?: string) => void; notify: (message: string) => void }) {
  const [active, setActive] = useState(1)
  const steps = [
    { title: 'Receber intimação', owner: 'Conector', rule: 'Novo documento recebido', icon: Network },
    { title: 'Classificar matéria', owner: 'IA + validação', rule: 'Confiança mínima: 85%', icon: Bot },
    { title: 'Distribuir responsável', owner: 'Orquestrador', rule: 'Matéria + menor carga', icon: Users },
    { title: 'Preparar manifestação', owner: 'Procurador', rule: 'Alerta em D-2 e D-1', icon: FileSignature },
    { title: 'Assinar e protocolar', owner: 'Procurador', rule: 'Confirmação A3 obrigatória', icon: Send },
  ]
  const simulate = () => {
    const next = (active + 1) % steps.length
    setActive(next)
    onAudit('Etapa de fluxo executada', steps[next].title, next === 1 ? 'IA' : 'Automação', `Transição fictícia registrada. Regra: ${steps[next].rule}.`, 'Orquestrador de fluxos')
    notify(`Fluxo avançou para “${steps[next].title}”.`)
  }
  const [waiting, setWaiting] = useState<WaitingBox[]>(waitingBoxSeed)
  const avocar = (item: WaitingBox) => {
    setWaiting((current) => current.filter((entry) => entry.id !== item.id))
    onAudit('Processo avocado da caixa de espera', item.process, 'Usuário', `Avocação antes do retorno automático (“${item.returnAt}”); tarefa devolvida à fila de decisão de ${item.owner}.`)
    notify(`Processo ${item.process} avocado e devolvido à fila ativa.`)
  }
  return <div className="stack-lg"><div className="workflow-layout"><section className="panel workflow-canvas"><div className="panel-heading"><div><p className="section-kicker">Fluxo ativo</p><h2>Tratamento de intimação judicial</h2></div><div className="toolbar-actions"><button className="secondary-button"><Settings2 size={16} /> Editar regras</button><button className="primary-button" onClick={simulate}><Play size={16} /> Simular próxima etapa</button></div></div><div className="flow-nodes">{steps.map((step, index) => { const Icon = step.icon; return <div className={`flow-node ${index === active ? 'active' : ''} ${index < active ? 'done' : ''}`} key={step.title}><div className="node-number">{index < active ? <Check size={16} /> : index + 1}</div><span className="node-icon"><Icon size={18} /></span><div><strong>{step.title}</strong><small>{step.owner}</small><p>{step.rule}</p></div>{index < steps.length - 1 && <div className="node-line" />}</div> })}</div></section><aside className="panel workflow-stats"><p className="section-kicker">Últimos 30 dias</p><h2>Desempenho do fluxo</h2><div className="big-stat"><strong>184</strong><span>instâncias executadas</span></div><div className="stat-list"><span><em>Tempo médio</em><strong>1d 4h</strong></span><span><em>Automatização</em><strong>72%</strong></span><span><em>Dentro do prazo</em><strong>98,4%</strong></span><span><em>Intervenções</em><strong>11</strong></span></div><div className="human-note"><UserCheck size={18} /><p><strong>Controle humano preservado</strong>Classificações, minutas e envios críticos possuem ponto de validação.</p></div></aside></div>
  <section className="panel">
    <div className="panel-heading"><div><p className="section-kicker">Item 5.28 do TR</p><h2>Caixas de espera com retorno automático</h2></div><span className="small-badge">{waiting.length} em espera</span></div>
    <div className="waiting-list">{waiting.length ? waiting.map((item) => <article className="waiting-row" key={item.id}>
      <span className="activity-icon source-automação"><Clock3 size={15} /></span>
      <div><strong>{item.process}</strong><p>{item.reason}</p><small>{item.owner} · {item.returnAt}</small></div>
      <button className="secondary-button" onClick={() => avocar(item)}><RotateCcw size={15} /> Avocar agora</button>
    </article>) : <EmptyState icon={CheckCircle2} title="Nenhum processo em espera" text="Os processos avocados voltaram à fila ativa; novos itens entram aqui automaticamente pelas regras do fluxo." />}</div>
    <div className="table-footer"><span>O retorno automático devolve o processo à fila na data-limite sem intervenção humana.</span><span>A avocação registra evento de auditoria.</span></div>
  </section>
</div>
}

function AiView({ onAudit, notify }: { onAudit: (action: string, target: string, source: AuditEvent['source'], detail: string, actor?: string) => void; notify: (message: string) => void }) {
  const [text, setText] = useState(demoText)
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const analyze = () => {
    const classification = classifyLegalText(text)
    setResult(classification)
    onAudit('Documento analisado', classification.documentType, 'IA', `${classification.area}; confiança ${classification.confidence}%; sinais: ${classification.signals.join(', ')}.`, 'Classificador jurídico local')
    notify('Análise concluída; resultado aguarda validação humana.')
  }
  return <div className="ai-layout"><section className="panel ai-input-panel"><div className="panel-heading"><div><p className="section-kicker">Documento de entrada</p><h2>Conteúdo para triagem</h2></div><span className="small-badge"><ShieldCheck size={14} /> dado fictício</span></div><textarea value={text} onChange={(e) => setText(e.target.value)} aria-label="Conteúdo jurídico fictício" /><div className="ai-input-footer"><span>{text.length} caracteres · processamento local determinístico</span><button className="primary-button" onClick={analyze}><Sparkles size={17} /> Analisar documento</button></div></section><section className="panel ai-result-panel">{result ? <><div className="ai-result-top"><div className="confidence-ring" style={{ '--confidence': `${result.confidence * 3.6}deg` } as React.CSSProperties}><span>{result.confidence}%<small>confiança</small></span></div><div><p className="section-kicker">Classificação sugerida</p><h2>{result.area}</h2><span>{result.documentType} · Complexidade {result.complexity.toLowerCase()}</span></div></div><div className="explanation-grid"><div><small>Sinais identificados</small><div className="tag-list">{result.signals.map((signal) => <span key={signal}>{signal}</span>)}</div></div><div><small>Fundamentação indicada</small>{result.legalBasis.map((basis) => <p key={basis}><Scale size={14} /> {basis}</p>)}</div><div className="full-row"><small>Fluxo sugerido</small><p><GitBranch size={14} /> {result.suggestedFlow}</p></div></div><div className="validation-bar"><div><UserCheck size={18} /><span><strong>Decisão humana necessária</strong>Revise a classificação antes de aplicar ao processo.</span></div><button className="secondary-button" onClick={() => notify('Classificação validada e registrada na trilha de auditoria.')}><Check size={16} /> Validar</button></div></> : <EmptyState icon={Bot} title="Pronta para analisar" text="Execute a triagem para ver classe, confiança, sinais, fundamento e fluxo sugerido." />}</section></div>
}

interface ConnectorHealth { tribunal: string; ok: boolean; latencyMs: number | null; totalIndexed: number | null; totalRelation?: string | null; error?: string }

function IntegrationsView({ onAudit, notify }: { onAudit: (action: string, target: string, source: AuditEvent['source'], detail: string, actor?: string) => void; notify: (message: string) => void }) {
  const [health, setHealth] = useState<Record<string, ConnectorHealth> | null>(null)
  const [checking, setChecking] = useState(false)
  const [lookupNumber, setLookupNumber] = useState('')
  const [lookupTribunal, setLookupTribunal] = useState('TJSP')
  const [lookup, setLookup] = useState<{ loading: boolean; error?: string; result?: DatajudProcess; latency?: number } | null>(null)
  const [comunicacoes, setComunicacoes] = useState<{ total: number; latency: number; itens: Array<{ id: number; data: string | null; tipo: string | null; orgao: string | null; resumo: string | null }> } | null>(null)

  const checkHealth = async (announce = false) => {
    setChecking(true)
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/integrations/status`, { credentials: 'same-origin' })
      if (!response.ok) throw new Error()
      const payload = await response.json()
      const map: Record<string, ConnectorHealth> = {}
      for (const item of payload.results as ConnectorHealth[]) map[item.tribunal] = item
      setHealth(map)
      if (announce) {
        const okCount = (payload.results as ConnectorHealth[]).filter((item) => item.ok).length
        onAudit('Saúde das integrações verificada', 'API Pública DataJud/CNJ', 'Integração', `${okCount} de ${payload.results.length} tribunais respondendo em consulta real.`, 'Central de integrações')
        notify(`${okCount} tribunais responderam à consulta real.`)
      }
    } catch {
      if (announce) notify('Falha ao consultar a API Pública DataJud.')
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => { void checkHealth() }, [])

  const digits = lookupNumber.replace(/\D/g, '')
  const runLookup = async () => {
    setLookup({ loading: true })
    setComunicacoes(null)
    try {
      // As duas consultas reais em paralelo: processo (DataJud) e
      // citações/intimações publicadas no diário (DJEN).
      const [processoRes, djenRes] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}api/integrations/datajud/process`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tribunal: lookupTribunal, number: digits }),
        }),
        fetch(`${import.meta.env.BASE_URL}api/integrations/djen/comunicacoes`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tribunal: lookupTribunal, number: digits }),
        }).catch(() => null),
      ])
      const payload = await processoRes.json()
      if (!processoRes.ok) {
        setLookup({ loading: false, error: payload.error || 'Falha na consulta.' })
      } else {
        setLookup({ loading: false, result: payload.process, latency: payload.latencyMs })
        onAudit('Consulta processual real', payload.process.numeroProcesso, 'Integração', `DataJud/CNJ · ${lookupTribunal} · ${payload.latencyMs} ms.`, 'API Pública DataJud')
      }
      if (djenRes?.ok) {
        const djen = await djenRes.json()
        setComunicacoes({ total: djen.total, latency: djen.latencyMs, itens: djen.comunicacoes || [] })
        onAudit('Comunicações do diário consultadas', digits || lookupTribunal, 'Integração', `DJEN/CNJ · ${djen.comunicacoes?.length ?? 0} de ${djen.total} comunicações · ${djen.latencyMs} ms.`, 'DJEN — Comunicações')
      }
      if (processoRes.ok) notify('Consulta real concluída: processo e comunicações do diário.')
    } catch {
      setLookup({ loading: false, error: 'Não foi possível alcançar o serviço de integração.' })
    }
  }

  const indexedLabel = (item?: ConnectorHealth) => {
    if (!item) return 'verificando…'
    if (!item.ok) return 'sem resposta'
    if (item.totalIndexed === null) return 'ativo'
    const suffix = item.totalRelation === 'gte' ? '+' : ''
    return `${new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(item.totalIndexed)}${suffix} processos indexados`
  }

  return <div className="stack-lg">
    <div className="integration-banner real"><Network size={21} /><div><strong>Consultas reais homologadas — DataJud e DJEN (CNJ)</strong><p>Os conectores de tribunais consultam o índice nacional de processos, e o DJEN entrega citações e intimações publicadas no diário — tudo com latência e resposta auditadas. SEI/PEN, 1DOC e STF seguem honestamente marcados como pendentes de convênio.</p></div><button className="secondary-button" disabled={checking} onClick={() => void checkHealth(true)}>{checking ? <RefreshCw className="spin" size={16} /> : <Activity size={16} />} Verificar agora</button></div>

    <section className="panel datajud-panel">
      <div className="panel-heading"><div><p className="section-kicker">Consulta unitária</p><h2>Buscar processo real por número CNJ</h2></div><a className="secondary-button" href={`${import.meta.env.BASE_URL}api/docs`} target="_blank" rel="noreferrer"><FileText size={16} /> Documentação da API (OpenAPI)</a></div>
      <div className="datajud-lookup-bar">
        <select value={lookupTribunal} onChange={(e) => setLookupTribunal(e.target.value)} aria-label="Tribunal">{datajudTribunals.map((item) => <option key={item}>{item}</option>)}</select>
        <div className="search-input"><Search size={16} /><input value={lookupNumber} onChange={(e) => { setLookupNumber(e.target.value); setLookup(null) }} placeholder="0000000-00.0000.0.00.0000" /></div>
        <button className="primary-button" disabled={digits.length !== 20 || lookup?.loading} onClick={runLookup}>{lookup?.loading ? <RefreshCw className="spin" size={16} /> : <Play size={16} />} Consultar</button>
      </div>
      {lookup?.error && <p className="search-error"><AlertTriangle size={15} /> {lookup.error}</p>}
      {lookup?.result && <DatajudResultCard result={lookup.result} latency={lookup.latency ?? null} />}
      {comunicacoes && (
        <div className="datajud-result">
          <div className="datajud-result-head"><BadgeCheck size={17} /><div><strong>Comunicações no diário (DJEN)</strong><small>{comunicacoes.itens.length} de {comunicacoes.total} · {comunicacoes.latency} ms</small></div><span className="small-badge success">Dado real · DJEN/CNJ</span></div>
          {comunicacoes.itens.length === 0
            ? <p className="search-hint">Nenhuma citação/intimação publicada para este número.</p>
            : <div className="djen-list">{comunicacoes.itens.slice(0, 5).map((item) => (
                <div className="djen-item" key={item.id}>
                  <div><strong>{item.tipo || 'Comunicação'}</strong><small>{item.data || ''} · {item.orgao || ''}</small></div>
                  {item.resumo && <p>{item.resumo}…</p>}
                </div>
              ))}</div>}
        </div>
      )}
    </section>

    <section className="integration-grid">{connectors.map((connector) => {
      const item = connector.tribunal ? health?.[connector.tribunal] : undefined
      const statusClass = connector.mode === 'real' ? (item && !item.ok ? 'down' : '') : 'demo'
      const statusLabel = connector.mode === 'real'
        ? (item && !item.ok ? 'Sem resposta' : 'Integração real ativa')
        : connector.mode === 'convenio' ? 'Aguardando convênio' : 'Demonstração interna'
      return <article className="integration-card" key={connector.name}>
        <div className="connector-logo"><Landmark size={20} /></div>
        <div className="connector-title"><strong>{connector.name}</strong><small>{connector.group}</small></div>
        <span className={`connector-status ${statusClass}`}>{statusLabel}</span>
        <div className="connector-detail">
          <span><small>Escopo</small><strong>{connector.detail}</strong></span>
          {connector.mode === 'real'
            ? <span><small>Índice público</small><strong>{indexedLabel(item)}{item?.ok && item.latencyMs !== null ? ` · ${item.latencyMs} ms` : ''}</strong></span>
            : <span><small>Situação</small><strong>{connector.pending ?? 'Dados fictícios para demonstração'}</strong></span>}
        </div>
      </article>
    })}</section>
  </div>
}

function AuditView({ events, notify }: { events: AuditEvent[]; notify: (message: string) => void }) {
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), environment: 'demonstracao', events }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'jurisflow-auditoria-demo.json'
    anchor.click()
    URL.revokeObjectURL(url)
    notify('Trilha de auditoria exportada em formato aberto JSON.')
  }
  return <section className="panel audit-panel"><div className="toolbar"><div><p className="section-kicker">Eventos imutáveis da sessão</p><h2>{events.length} registros de demonstração</h2></div><div className="toolbar-actions"><button className="secondary-button"><Filter size={16} /> Filtrar</button><button className="primary-button" onClick={exportData}><Download size={16} /> Exportar JSON</button></div></div><div className="audit-list">{events.map((event) => { const Icon = sourceIcon[event.source]; return <article className="audit-event" key={event.id}><span className={`activity-icon source-${event.source.toLowerCase()}`}><Icon size={16} /></span><div className="audit-main"><div><strong>{event.action}</strong><span className="small-badge">{event.source}</span></div><p>{event.detail}</p><small><b>{event.actor}</b> · alvo: {event.target}</small></div><time>{event.at}</time></article> })}</div></section>
}

function PocView({ onNavigate, auditCount }: { onNavigate: (id: ViewId) => void; auditCount: number }) {
  const demonstrable = pocRequirements.filter((item) => item.coverage === 'Demonstrável').length
  return <div className="poc-layout"><section className="poc-summary"><div className="poc-score"><span><strong>{demonstrable}</strong><small>de 10</small></span></div><div><p className="section-kicker">Cobertura desta entrega</p><h2>{demonstrable} de {pocRequirements.length} requisitos demonstráveis</h2><p>Inclui consulta processual real (DataJud/CNJ), criação real de usuários com senha e assinatura digital PAdES real. A matriz não representa aprovação formal.</p></div><div className="poc-meta"><span><Clock3 size={16} /><strong>Até 6 horas</strong><small>sessão prevista no TR</small></span><span><Activity size={16} /><strong>{auditCount} eventos</strong><small>rastreáveis nesta sessão</small></span><span><Users size={16} /><strong>Dados fictícios</strong><small>exigência do item 12.16</small></span></div></section><section className="panel requirement-panel"><div className="panel-heading"><div><p className="section-kicker">Matriz do item 12.7</p><h2>Roteiro navegável</h2></div><div className="coverage-legend"><span><i className="green" />Demonstrável</span><span><i className="amber" />Simulado</span></div></div><div className="requirement-list">{pocRequirements.map((item, index) => <button key={item.ref} onClick={() => onNavigate(item.view)}><span className="requirement-number">{String(index + 1).padStart(2, '0')}</span><div><div><strong>{item.ref} · {item.title}</strong><span className={`coverage-badge ${item.coverage.toLowerCase()}`}>{item.coverage}</span></div><p>{item.evidence}</p></div><ChevronRight size={18} /></button>)}</div></section><div className="poc-callout"><ShieldCheck size={22} /><div><strong>Critério de honestidade da POC</strong><p>A consulta processual usa a API Pública DataJud/CNJ com dados reais dos tribunais. A assinatura PAdES é real; a cadeia ICP-Brasil (e-CPF A1 ou token A3 via PKCS#11) é configurada no ambiente. DJEN, SEI/PEN, 1DOC e sistema tributário municipal dependem de convênio/credenciais e permanecem sinalizados como pendentes.</p></div></div></div>
}

function ProcessDrawer({ process, onClose }: { process: LegalProcess; onClose: () => void }) {
  return <div className="drawer-layer"><button className="drawer-scrim" onClick={onClose} aria-label="Fechar detalhes" /><aside className="process-drawer"><div className="drawer-header"><div><p className="section-kicker">{process.type}</p><h2>{process.title}</h2><small>{process.number}</small></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div><div className="drawer-status"><StatusBadge value={process.status} /><span className={`priority-label ${process.priority.toLowerCase().replace('í', 'i')}`}>{process.priority}</span></div><div className="drawer-facts"><span><small>Parte</small><strong>{process.party}</strong></span><span><small>Responsável</small><strong>{process.owner}</strong></span><span><small>Prazo atual</small><strong>{process.deadline}</strong></span><span><small>Órgão / origem</small><strong>{process.court}</strong></span><span><small>Valor</small><strong>{process.value ? money(process.value) : 'Não se aplica'}</strong></span><span><small>Matéria</small><strong>{process.area}</strong></span></div><div className="timeline"><p className="section-kicker">Linha do tempo unificada</p>{[
    ['Agora', process.movement], ['Hoje, 15:54', 'Classificação e metadados registrados'], ['02 ago, 10:12', 'Documento recebido e pasta digital criada'],
  ].map(([time, text], index) => <div className="timeline-item" key={time}><i className={index === 0 ? 'active' : ''} /><div><small>{time}</small><p>{text}</p></div></div>)}</div><div className="drawer-actions"><button className="secondary-button"><Archive size={16} /> Caixa de espera</button><button className="primary-button"><FileSignature size={16} /> Abrir processo</button></div></aside></div>
}

const datajudTribunals = ['TJSP', 'TRF-3', 'TRT-15', 'STJ', 'TST']

function formatDatajudDate(value: string | null) {
  if (!value) return '—'
  const match = /^(\d{4})(\d{2})(\d{2})/.exec(value.replace(/\D/g, ''))
  if (match) return `${match[3]}/${match[2]}/${match[1]}`
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(parsed)
}

function DatajudResultCard({ result, latency }: { result: DatajudProcess; latency: number | null }) {
  return (
    <div className="datajud-result">
      <div className="datajud-result-head"><BadgeCheck size={17} /><div><strong>{result.numeroProcesso}</strong><small>{result.tribunal} · grau {result.grau} · {result.sistema ?? 'sistema não informado'}{latency !== null ? ` · ${latency} ms` : ''}</small></div><span className="small-badge success">Dado real · DataJud/CNJ</span></div>
      <div className="datajud-facts">
        <span><small>Classe</small><strong>{result.classe ?? '—'}</strong></span>
        <span><small>Órgão julgador</small><strong>{result.orgaoJulgador ?? '—'}</strong></span>
        <span><small>Ajuizamento</small><strong>{formatDatajudDate(result.dataAjuizamento)}</strong></span>
        <span><small>Movimentos</small><strong>{result.totalMovimentos}</strong></span>
        <span className="full-row"><small>Último movimento</small><strong>{result.ultimoMovimento?.nome ?? '—'} · {formatDatajudDate(result.ultimoMovimento?.dataHora ?? null)}</strong></span>
        {result.assuntos.length > 0 && <span className="full-row"><small>Assuntos</small><strong>{result.assuntos.join(' · ')}</strong></span>}
      </div>
    </div>
  )
}

function GlobalSearch({ processes, debts, onClose, onOpenProcess, onOpenDebts, onAudit }: {
  processes: LegalProcess[]
  debts: DebtCertificate[]
  onClose: () => void
  onOpenProcess: (process: LegalProcess) => void
  onOpenDebts: () => void
  onAudit: (action: string, target: string, source: AuditEvent['source'], detail: string, actor?: string) => void
}) {
  const [query, setQuery] = useState('')
  const [tribunal, setTribunal] = useState('TJSP')
  const [lookup, setLookup] = useState<{ loading: boolean; error?: string; result?: DatajudProcess; latency?: number } | null>(null)

  const normalized = query.trim().toLowerCase()
  const matchedProcesses = normalized
    ? processes.filter((item) => `${item.number} ${item.title} ${item.party} ${item.owner}`.toLowerCase().includes(normalized))
    : processes.slice(0, 4)
  const matchedDebts = normalized
    ? debts.filter((item) => `${item.cda} ${item.taxpayer}`.toLowerCase().includes(normalized))
    : []
  const digits = query.replace(/\D/g, '')
  const canLookup = digits.length === 20

  const runLookup = async () => {
    setLookup({ loading: true })
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/integrations/datajud/process`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tribunal, number: digits }),
      })
      const payload = await response.json()
      if (!response.ok) {
        setLookup({ loading: false, error: payload.error || 'Falha na consulta.' })
        return
      }
      setLookup({ loading: false, result: payload.process, latency: payload.latencyMs })
      onAudit('Consulta processual real', payload.process.numeroProcesso, 'Integração', `DataJud/CNJ · ${tribunal} · ${payload.latencyMs} ms.`, 'API Pública DataJud')
    } catch {
      setLookup({ loading: false, error: 'Não foi possível alcançar o serviço de integração.' })
    }
  }

  return (
    <div className="drawer-layer search-layer">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar busca" />
      <section className="search-modal" role="dialog" aria-label="Busca global">
        <div className="search-modal-input"><Search size={18} /><input autoFocus value={query} onChange={(e) => { setQuery(e.target.value); setLookup(null) }} placeholder="Número CNJ, CDA, parte ou assunto…" /><kbd>Esc</kbd></div>
        <div className="search-modal-body">
          {matchedProcesses.length > 0 && <div className="search-group"><small>Processos da amostra</small>{matchedProcesses.map((item) => <button key={item.id} className="search-result" onClick={() => onOpenProcess(item)}><BriefcaseBusiness size={16} /><div><strong>{item.title}</strong><span>{item.number} · {item.party}</span></div><ChevronRight size={16} /></button>)}</div>}
          {matchedDebts.length > 0 && <div className="search-group"><small>Dívida ativa</small>{matchedDebts.map((item) => <button key={item.id} className="search-result" onClick={onOpenDebts}><CircleDollarSign size={16} /><div><strong>{item.cda}</strong><span>{item.taxpayer} · {money(item.updated)}</span></div><ChevronRight size={16} /></button>)}</div>}
          {normalized && !matchedProcesses.length && !matchedDebts.length && !canLookup && <p className="search-empty">Nada encontrado na amostra local. Informe um número CNJ completo (20 dígitos) para consultar o tribunal.</p>}
          <div className="search-group datajud-group">
            <small>Consulta real ao tribunal (API Pública DataJud/CNJ)</small>
            <div className="datajud-lookup-bar">
              <select value={tribunal} onChange={(e) => setTribunal(e.target.value)} aria-label="Tribunal">{datajudTribunals.map((item) => <option key={item}>{item}</option>)}</select>
              <button className="primary-button" disabled={!canLookup || lookup?.loading} onClick={runLookup}>{lookup?.loading ? <RefreshCw className="spin" size={16} /> : <Network size={16} />} Consultar processo real</button>
            </div>
            {!canLookup && <p className="search-hint">Digite os 20 dígitos do número CNJ para habilitar a consulta.</p>}
            {lookup?.error && <p className="search-error"><AlertTriangle size={15} /> {lookup.error}</p>}
            {lookup?.result && <DatajudResultCard result={lookup.result} latency={lookup.latency ?? null} />}
          </div>
        </div>
      </section>
    </div>
  )
}

const roleCatalog: { id: AppUser['role']; label: string; permissions: string }[] = [
  { id: 'guest', label: 'Consulta', permissions: 'Visualiza processos, prazos e relatórios. Não assina nem administra.' },
  { id: 'presenter', label: 'Apresentação', permissions: 'Conduz a demonstração, gera petições e executa o fluxo de assinatura.' },
  { id: 'owner', label: 'Administração', permissions: 'Gerencia usuários, permissões, integrações e configurações.' },
]

function UsersView({ onAudit, notify }: { onAudit: (action: string, target: string, source: AuditEvent['source'], detail: string, actor?: string) => void; notify: (message: string) => void }) {
  const [users, setUsers] = useState<AppUser[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ displayName: '', username: '', password: '', role: 'guest' as AppUser['role'] })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/admin/users`, { credentials: 'same-origin' })
      if (!response.ok) throw new Error()
      const payload = await response.json()
      setUsers(payload.users)
      setError(null)
    } catch {
      setError('Não foi possível carregar os usuários.')
    }
  }

  useEffect(() => { void load() }, [])

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/admin/users`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json()
      if (!response.ok) {
        notify(payload.error || 'Não foi possível criar o usuário.')
        return
      }
      setUsers((current) => [payload.user, ...(current ?? [])])
      onAudit('Usuário criado', payload.user.username, 'Usuário', `Perfil ${payload.user.role}; senha definida com hash scrypt no servidor.`)
      notify(`Usuário ${payload.user.username} criado. Já consegue entrar com a senha definida.`)
      setForm({ displayName: '', username: '', password: '', role: 'guest' })
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (user: AppUser) => {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin/users/${user.id}`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !user.active }),
    })
    if (!response.ok) {
      notify('Não foi possível alterar a situação do usuário.')
      return
    }
    setUsers((current) => (current ?? []).map((item) => item.id === user.id ? { ...item, active: !user.active } : item))
    onAudit(user.active ? 'Usuário desativado' : 'Usuário reativado', user.username, 'Usuário', 'Situação da conta alterada pela administração.')
    notify(`Conta ${user.username} ${user.active ? 'desativada' : 'reativada'}.`)
  }

  const roleLabel = (role: AppUser['role']) => roleCatalog.find((item) => item.id === role)?.label ?? role

  return (
    <div className="users-layout">
      <section className="panel users-table-panel">
        <div className="panel-heading"><div><p className="section-kicker">Contas reais deste ambiente</p><h2>{users ? `${users.length} usuário(s)` : 'Carregando…'}</h2></div><div className="toolbar-actions"><button className="secondary-button" onClick={() => void load()}><RefreshCw size={16} /> Atualizar</button><button className="secondary-button" disabled={!users?.length} onClick={() => {
          const rows = (users ?? []).map((user) => [user.displayName, user.username, roleLabel(user.role), user.ssoOnly ? 'Convite SSO' : 'Usuário e senha', user.active ? 'Ativa' : 'Desativada', new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(user.createdAt))])
          const csv = ['Nome;Usuário;Perfil;Origem;Situação;Criado em', ...rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';'))].join('\r\n')
          const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = 'jurisflow-usuarios.csv'
          anchor.click()
          URL.revokeObjectURL(url)
          onAudit('Relatório de usuários exportado', `${users?.length ?? 0} conta(s)`, 'Usuário', 'Exportação CSV de todos os usuários cadastrados (item 6.4.3 do TR).')
          notify('Relatório de usuários exportado em CSV.')
        }}><Download size={16} /> Exportar relatório</button></div></div>
        {error && <p className="search-error"><AlertTriangle size={15} /> {error}</p>}
        <div className="table-scroll"><table className="responsive-table users-table"><thead><tr><th>Usuário</th><th>Perfil</th><th>Origem</th><th>Situação</th><th /></tr></thead><tbody>
          {(users ?? []).map((user) => <tr key={user.id}>
            <td className="mobile-card-title"><span className="table-primary"><strong>{user.displayName}</strong><small>{user.username}</small></span></td>
            <td data-label="Perfil"><span className="small-badge">{roleLabel(user.role)}</span></td>
            <td data-label="Origem">{user.ssoOnly ? 'Convite SSO' : 'Usuário e senha'}</td>
            <td data-label="Situação"><span className={`status-badge ${user.active ? 'status-elegivel' : 'status-suspenso'}`}>{user.active ? 'Ativa' : 'Desativada'}</span></td>
            <td className="mobile-card-action"><button className="secondary-button" onClick={() => void toggleActive(user)}>{user.active ? 'Desativar' : 'Reativar'}</button></td>
          </tr>)}
        </tbody></table></div>
        <div className="table-footer"><span>Senhas armazenadas com hash scrypt; nenhuma senha é exibida ou recuperável.</span><span>Todo acesso gera evento de auditoria.</span></div>
      </section>
      <aside className="stack-lg">
        <section className="panel user-create-panel">
          <p className="section-kicker">Novo usuário</p>
          <h2>Criar acesso com senha</h2>
          <form onSubmit={createUser} className="user-form">
            <label>Nome completo<input required minLength={3} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Maria Beatriz Ferrari" /></label>
            <label>Usuário<input required minLength={3} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="maria.ferrari" /></label>
            <label>Senha<input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="mínimo de 8 caracteres" /></label>
            <label>Perfil<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AppUser['role'] })}>{roleCatalog.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}</select></label>
            <button className="primary-button full" disabled={saving} type="submit">{saving ? <RefreshCw className="spin" size={16} /> : <Plus size={16} />} Criar usuário</button>
          </form>
        </section>
        <section className="panel role-panel">
          <p className="section-kicker">Perfis e permissões</p>
          <h2>O que cada perfil pode fazer</h2>
          <div className="role-list">{roleCatalog.map((role) => <div className="role-row" key={role.id}><ShieldCheck size={17} /><div><strong>{role.label}</strong><p>{role.permissions}</p></div></div>)}</div>
          <div className="human-note"><Fingerprint size={18} /><p><strong>Assinatura digital</strong>Perfis Apresentação e Administração executam o fluxo real de assinatura PAdES da Central de Peticionamento.</p></div>
        </section>
      </aside>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) {
  return <div className="empty-state"><span><Icon size={26} /></span><h3>{title}</h3><p>{text}</p></div>
}

function StatusBadge({ value }: { value: string }) {
  return <span className={`status-badge status-${value.toLowerCase().replaceAll(' ', '-').replaceAll('ç', 'c').replaceAll('ã', 'a')}`}>{value}</span>
}

function initials(name: string) {
  return name.replace(/Dr(a)?\.\s/, '').split(' ').slice(0, 2).map((part) => part[0]).join('')
}

export default App
