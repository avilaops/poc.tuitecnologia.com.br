import { describe, expect, it } from 'vitest'
import { classifyLegalText, updateDebt } from './demoEngine'

describe('demoEngine', () => {
  it('classifica conteúdo tributário e mantém a decisão explicável', () => {
    const result = classifyLegalText('Intimação em execução fiscal relativa a CDA de IPTU, com prazo de 15 dias.')
    expect(result.area).toBe('Tributário')
    expect(result.documentType).toBe('Intimação')
    expect(result.signals).toContain('iptu')
    expect(result.confidence).toBeGreaterThanOrEqual(90)
  })

  it('calcula juros simples e multa da dívida ativa', () => {
    expect(updateDebt(10_000, 1, 2, 3)).toBe(10_500)
  })
})
