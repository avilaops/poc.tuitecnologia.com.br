import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname } from 'node:path'
import express from 'express'
import forge from 'node-forge'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { SignPdf } from '@signpdf/signpdf'
import { P12Signer } from '@signpdf/signer-p12'
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib'

const p12Path = process.env.SIGN_P12_PATH || './var/jurisflow-sign.p12'
const p12Password = process.env.SIGN_P12_PASSWORD || 'jurisflow-poc'
const pkcs11Module = process.env.SIGN_PKCS11_MODULE || null

// Certificado enviado pela tela (self-service). Tem precedência sobre o
// configurado por variável de ambiente e sobre o certificado de teste.
const uploadedP12Path = './var/jurisflow-sign-enviado.p12'
const uploadedPassPath = './var/jurisflow-sign-enviado.pass'

function activePaths() {
  if (existsSync(uploadedP12Path) && existsSync(uploadedPassPath)) {
    return { path: uploadedP12Path, password: readFileSync(uploadedPassPath, 'utf8'), uploaded: true }
  }
  return { path: p12Path, password: p12Password, uploaded: false }
}

// Sem certificado configurado, gera um certificado de teste autoassinado para a
// demonstração. A assinatura PAdES produzida é real (CMS/PKCS#7 embutido no PDF);
// para validade jurídica plena basta apontar SIGN_P12_PATH para um e-CPF/e-CNPJ
// A1 ICP-Brasil, ou usar o token A3 via driver PKCS#11 (SIGN_PKCS11_MODULE).
function ensureCertificate() {
  if (existsSync(p12Path)) return
  mkdirSync(dirname(p12Path), { recursive: true })
  const keys = forge.pki.rsa.generateKeyPair(2048)
  const cert = forge.pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = `01${Date.now()}`
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)
  const attrs = [
    { name: 'commonName', value: 'Helena Prado (CERTIFICADO DE TESTE)' },
    { name: 'organizationName', value: 'Tui Tecnologia / JurisFlow POC' },
    { name: 'countryName', value: 'BR' },
  ]
  cert.setSubject(attrs)
  cert.setIssuer([
    { name: 'commonName', value: 'AC Demonstração JurisFlow (NÃO ICP-Brasil)' },
    { name: 'organizationName', value: 'Tui Tecnologia' },
    { name: 'countryName', value: 'BR' },
  ])
  cert.setExtensions([
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, nonRepudiation: true },
  ])
  cert.sign(keys.privateKey, forge.md.sha256.create())
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], p12Password, { algorithm: '3des' })
  writeFileSync(p12Path, Buffer.from(forge.asn1.toDer(p12Asn1).getBytes(), 'binary'), { mode: 0o600 })
}

function parseCertificate(p12Bytes, password) {
  const p12Der = forge.util.createBuffer(p12Bytes.toString('binary'))
  const p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(p12Der), password)
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag]
  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag]
  const cert = certBags?.find((bag) => bag.cert && !bag.cert.getExtension?.('basicConstraints')?.cA)?.cert ?? certBags?.[0]?.cert
  if (!cert) throw new Error('Certificado não encontrado no arquivo P12.')
  if (!keyBags?.length) throw new Error('Chave privada não encontrada no arquivo P12.')
  const field = (subject, name) => subject.getField(name)?.value ?? null
  const issuerCn = field(cert.issuer, 'CN') || ''
  return {
    subject: field(cert.subject, 'CN'),
    organization: field(cert.subject, 'O'),
    issuer: issuerCn,
    serialNumber: cert.serialNumber,
    notBefore: cert.validity.notBefore.toISOString(),
    notAfter: cert.validity.notAfter.toISOString(),
    expired: cert.validity.notAfter.getTime() < Date.now(),
    icpBrasil: /icp-?brasil/i.test(issuerCn) && !/não|nao/i.test(issuerCn),
    test: /AC Demonstração JurisFlow/i.test(issuerCn),
    algorithm: 'RSA-SHA256 (PAdES/CMS)',
  }
}

function readCertificate() {
  const active = activePaths()
  return { ...parseCertificate(readFileSync(active.path), active.password), uploaded: active.uploaded }
}

async function buildPetitionPdf({ processNumber, title, signerName }) {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595.28, 841.89]) // A4
  const font = await pdf.embedFont(StandardFonts.TimesRoman)
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const ink = rgb(0.09, 0.17, 0.22)
  const draw = (text, y, options = {}) =>
    page.drawText(text, { x: options.x ?? 70, y, size: options.size ?? 11, font: options.bold ? bold : font, color: ink, maxWidth: 455, lineHeight: 15 })

  draw('EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO', 770, { bold: true, size: 12 })
  draw(`Processo nº ${processNumber}`, 735, { bold: true })
  draw(`Petição — ${title}`, 715)
  draw('O MUNICÍPIO, por seu procurador ao final assinado digitalmente, vem,', 675)
  draw('respeitosamente, à presença de Vossa Excelência, apresentar manifestação', 660)
  draw('nos autos em epígrafe, nos termos da legislação aplicável.', 645)
  draw('CONTEÚDO DEMONSTRATIVO — Prova de Conceito (Pregão Eletrônico nº 110/2026).', 605)
  draw('Todas as informações são fictícias; o documento existe para demonstrar o fluxo', 590)
  draw('real de geração e assinatura digital PAdES no JurisFlow Municipal.', 575)
  draw('Nestes termos, pede deferimento.', 535)
  draw(`${signerName}`, 495, { bold: true })
  draw('Procurador(a) do Município — assinado digitalmente (PAdES)', 480, { size: 9 })
  return pdf
}

export async function signPetition({ processNumber, title, signerName }) {
  ensureCertificate()
  const pdf = await buildPetitionPdf({ processNumber, title, signerName })
  pdflibAddPlaceholder({
    pdfDoc: pdf,
    reason: `Assinatura de petição — processo ${processNumber}`,
    contactInfo: 'poc.tuitecnologia.com.br',
    name: signerName,
    location: 'Brasil',
  })
  const withPlaceholder = Buffer.from(await pdf.save({ useObjectStreams: false }))
  const active = activePaths()
  const signer = new P12Signer(readFileSync(active.path), { passphrase: active.password })
  const signed = await new SignPdf().sign(withPlaceholder, signer)
  return signed
}

export function registerSigningRoutes(app, { requireSession, recordEvent }) {
  ensureCertificate()

  app.get('/api/sign/certificate', requireSession, async (_req, res, next) => {
    try {
      res.json({
        mode: 'A1 (arquivo PKCS#12 no servidor)',
        pkcs11Module,
        a3Ready: Boolean(pkcs11Module),
        certificate: readCertificate(),
      })
    } catch (error) {
      next(error)
    }
  })

  // Upload self-service do certificado A1 (.pfx/.p12) pela tela — perfil owner.
  app.post('/api/sign/certificate/upload', requireSession, express.json({ limit: '256kb' }), async (req, res, next) => {
    try {
      if (req.auth.role !== 'owner') return res.status(403).json({ error: 'Apenas o perfil Administração pode gerenciar o certificado.' })
      const base64 = String(req.body?.p12Base64 || '')
      const password = String(req.body?.password || '')
      if (!base64 || base64.length > 180_000) return res.status(400).json({ error: 'Envie um arquivo .pfx/.p12 de até 128 KB.' })
      if (!password) return res.status(400).json({ error: 'Informe a senha do certificado.' })

      let p12Bytes
      try {
        p12Bytes = Buffer.from(base64, 'base64')
      } catch {
        return res.status(400).json({ error: 'Arquivo inválido.' })
      }
      let info
      try {
        info = parseCertificate(p12Bytes, password)
      } catch {
        return res.status(400).json({ error: 'Não foi possível abrir o certificado — confira o arquivo e a senha.' })
      }
      if (info.expired) return res.status(400).json({ error: `Certificado expirado em ${new Date(info.notAfter).toLocaleDateString('pt-BR')}.` })

      mkdirSync(dirname(uploadedP12Path), { recursive: true })
      writeFileSync(uploadedP12Path, p12Bytes, { mode: 0o600 })
      writeFileSync(uploadedPassPath, password, { mode: 0o600 })
      await recordEvent(req, 'sign_certificate_installed', {
        userId: req.auth.user_id,
        success: true,
        metadata: { subject: info.subject, issuer: info.issuer, serialNumber: info.serialNumber, icpBrasil: info.icpBrasil, notAfter: info.notAfter },
      })
      res.status(201).json({ certificate: { ...info, uploaded: true } })
    } catch (error) {
      next(error)
    }
  })

  // Remove o certificado enviado e volta ao configurado por ambiente (ou de teste).
  app.delete('/api/sign/certificate', requireSession, async (req, res, next) => {
    try {
      if (req.auth.role !== 'owner') return res.status(403).json({ error: 'Apenas o perfil Administração pode gerenciar o certificado.' })
      rmSync(uploadedP12Path, { force: true })
      rmSync(uploadedPassPath, { force: true })
      ensureCertificate()
      await recordEvent(req, 'sign_certificate_removed', { userId: req.auth.user_id, success: true })
      res.json({ certificate: readCertificate() })
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/sign/petition', requireSession, async (req, res, next) => {
    try {
      const processNumber = String(req.body?.processNumber || '').slice(0, 40)
      const title = String(req.body?.title || 'Manifestação').slice(0, 120)
      if (!processNumber) return res.status(400).json({ error: 'Informe o número do processo.' })
      const signerName = req.auth.display_name || 'Procurador(a)'
      const signed = await signPetition({ processNumber, title, signerName })
      const certificate = readCertificate()
      await recordEvent(req, 'petition_signed', {
        userId: req.auth.user_id,
        success: true,
        metadata: { processNumber, title, subject: certificate.subject, serialNumber: certificate.serialNumber, icpBrasil: certificate.icpBrasil },
      })
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="peticao-${processNumber.replace(/[^\d.-]/g, '')}-assinada.pdf"`)
      res.setHeader('X-Signature-Subject', encodeURIComponent(certificate.subject ?? ''))
      res.send(signed)
    } catch (error) {
      next(error)
    }
  })
}
