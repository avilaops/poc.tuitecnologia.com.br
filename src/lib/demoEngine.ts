export interface ClassificationResult {
  area: string
  documentType: string
  complexity: 'Baixa' | 'Média' | 'Alta'
  confidence: number
  legalBasis: string[]
  suggestedFlow: string
  signals: string[]
}

export function classifyLegalText(text: string): ClassificationResult {
  const normalized = text.toLocaleLowerCase('pt-BR')
  const taxSignals = ['tribut', 'iptu', 'iss', 'cda', 'dívida ativa', 'execução fiscal']
  const laborSignals = ['trabalh', 'reclamação', 'rescisão', 'empregado']
  const adminSignals = ['licitação', 'contrato', 'administrativo', 'servidor', 'parecer']

  const matchedTax = taxSignals.filter((signal) => normalized.includes(signal))
  const matchedLabor = laborSignals.filter((signal) => normalized.includes(signal))
  const matchedAdmin = adminSignals.filter((signal) => normalized.includes(signal))
  const ranking = [
    { area: 'Tributário', matches: matchedTax },
    { area: 'Trabalhista', matches: matchedLabor },
    { area: 'Administrativo', matches: matchedAdmin },
  ].sort((a, b) => b.matches.length - a.matches.length)

  const winner = ranking[0]
  const hasDeadline = /prazo|dias|intimação|citação/.test(normalized)
  const confidence = Math.min(98, 72 + winner.matches.length * 7 + (hasDeadline ? 4 : 0))
  const complexity = text.length > 600 || /liminar|recurso|inconstitucional/.test(normalized) ? 'Alta' : text.length > 220 ? 'Média' : 'Baixa'
  const documentType = normalized.includes('intimação') ? 'Intimação' : normalized.includes('citação') ? 'Citação' : normalized.includes('parecer') ? 'Solicitação de parecer' : 'Petição inicial'

  return {
    area: winner.matches.length ? winner.area : 'Cível',
    documentType,
    complexity,
    confidence,
    legalBasis: winner.area === 'Tributário' ? ['Lei 6.830/1980', 'CTN, arts. 201–204'] : winner.area === 'Trabalhista' ? ['CLT', 'CPC subsidiário'] : ['Lei 14.133/2021', 'Normas municipais aplicáveis'],
    suggestedFlow: winner.area === 'Tributário' ? 'Triagem fiscal → validar CDA → gerar minuta → assinatura A3' : 'Triagem → distribuição por matéria → análise → validação humana',
    signals: winner.matches.length ? winner.matches : ['conteúdo processual genérico'],
  }
}

export function updateDebt(principal: number, monthlyInterest: number, finePercent: number, months: number) {
  const interest = principal * (monthlyInterest / 100) * months
  const fine = principal * (finePercent / 100)
  return Math.round((principal + interest + fine) * 100) / 100
}

