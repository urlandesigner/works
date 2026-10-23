import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

export interface PdfTextExtractionDebug {
  pageCount: number
  totalItems: number
  totalLines: number
  /** Primeiras linhas reconstruídas (leitura humana). */
  linePreview: string[]
}

interface TextPiece {
  str: string
  x: number
  y: number
  height: number
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

type PdfTextItem = {
  str: string
  transform: number[]
  height?: number
  hasEOL?: boolean
}

function isTextItem(item: unknown): item is PdfTextItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'str' in item &&
    typeof (item as PdfTextItem).str === 'string' &&
    'transform' in item &&
    Array.isArray((item as PdfTextItem).transform) &&
    (item as PdfTextItem).transform!.length >= 6
  )
}

/**
 * Agrupa itens de texto por baseline (Y), ordena por X e monta linhas legíveis.
 */
function buildLinesFromPageItems(items: readonly PdfTextItem[]): string[] {
  const pieces: TextPiece[] = []

  for (const item of items) {
    if (!('str' in item) || typeof item.str !== 'string') continue
    const s = item.str
    if (!s) continue

    const t = item.transform
    if (!t || t.length < 6) continue

    const x = t[4]!
    const y = t[5]!
    const height =
      typeof item.height === 'number' && item.height > 0 ? item.height : 12

    pieces.push({ str: s, x, y, height })
  }

  if (pieces.length === 0) return []

  const hMed = median(pieces.map((p) => p.height))
  const lineThreshold = Math.max(2.5, Math.min(12, hMed * 0.45))

  pieces.sort((a, b) => b.y - a.y || a.x - b.x)

  const lineGroups: TextPiece[][] = []
  let current: TextPiece[] = []
  let baseY: number | null = null

  for (const p of pieces) {
    if (baseY === null) {
      current = [p]
      baseY = p.y
      continue
    }
    if (Math.abs(p.y - baseY) <= lineThreshold) {
      current.push(p)
    } else {
      lineGroups.push(current)
      current = [p]
      baseY = p.y
    }
  }
  if (current.length) lineGroups.push(current)

  return lineGroups.map((group) => {
    const sorted = [...group].sort((a, b) => a.x - b.x)
    return sorted.map((g) => g.str).join(' ')
  })
}

export interface ExtractTextFromPdfResult {
  text: string
  debug: PdfTextExtractionDebug
}

/**
 * Extrai texto do PDF usando `getTextContent().items`, reconstruindo linhas por posição.
 * Todas as páginas são processadas.
 */
export async function extractTextFromPdf(file: File): Promise<ExtractTextFromPdfResult> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const loadingTask = pdfjsLib.getDocument({ data: bytes })
  const pdf = await loadingTask.promise

  const allLines: string[] = []
  let totalItems = 0

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const items: PdfTextItem[] = []
    for (const it of content.items) {
      if (isTextItem(it)) items.push(it)
    }
    totalItems += items.length

    const pageLines = buildLinesFromPageItems(items)
    for (const line of pageLines) {
      const trimmed = line.replace(/\s+/g, ' ').trim()
      if (trimmed.length > 0) allLines.push(trimmed)
    }
  }

  const text = allLines.join('\n')
  const debug: PdfTextExtractionDebug = {
    pageCount: pdf.numPages,
    totalItems,
    totalLines: allLines.length,
    linePreview: allLines.slice(0, 20),
  }

  return { text, debug }
}
