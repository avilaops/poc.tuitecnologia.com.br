# Metodologia de Migração de Dados — JurisFlow Municipal

Documento de compromisso técnico exigido pelo item 6.4.41/6.4.42 do Termo de
Referência (Pregão Eletrônico nº 110/2026): migração e parametrização completas
em até **90 dias corridos** a partir da assinatura do contrato.

## Escopo

Migração dos acervos existentes da Procuradoria para o JurisFlow Municipal:

1. **Sistemas legados** (SEDEP, JUSBRASIL e planilhas de controle) — processos,
   partes, prazos, movimentos, documentos e histórico de responsáveis.
2. **Processos físicos** — digitalização assistida com OCR, indexação por
   número CNJ/administrativo e vinculação à pasta digital.
3. **Dívida ativa** — CDAs, parcelamentos/REFIS, pagamentos e situação de
   ajuizamento, conciliados com o sistema tributário municipal.

## Método (cronograma dentro dos 90 dias)

| Fase | Janela | Entrega |
|---|---|---|
| 1. Inventário e dicionário de dados | dias 1–10 | Mapa de origem→destino por entidade, com responsável designado |
| 2. Extração e normalização | dias 11–30 | Cargas brutas em área de homologação; deduplicação e verificação de litispendência |
| 3. Carga assistida e conferência amostral | dias 31–60 | Migração por lotes com relatório de conferência (contagem, somas de valores, amostragem dirigida pela Procuradoria) |
| 4. Digitalização do acervo físico | dias 31–75 | Digitalização, OCR e indexação com trilha de custódia |
| 5. Paralelo controlado e virada | dias 61–85 | Operação em paralelo; divergências tratadas em fila própria |
| 6. Aceite e encerramento | dias 86–90 | Termo de aceite com relatório final de migração assinado |

## Garantias

- **Rastreabilidade**: todo registro migrado carrega origem, lote e hash de
  conferência; o relatório final permite auditar qualquer item de ponta a ponta.
- **Sem perda de histórico**: os sistemas de origem permanecem em modo consulta
  até o aceite formal.
- **Reversibilidade**: cada lote pode ser reprocessado isoladamente sem afetar
  os demais.
- **Dados pessoais**: tratamento conforme LGPD; acesso à área de homologação
  restrito e registrado.

---
Tui Tecnologia · poc.tuitecnologia.com.br
