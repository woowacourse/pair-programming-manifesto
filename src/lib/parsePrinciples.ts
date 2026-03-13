export interface ManifestoData {
  title: string
  subtitle: string
  principles: string[]
  footer: string
}

export function parsePrinciples(content: string): ManifestoData {
  const lines = content.split('\n')

  let title = ''
  let subtitle = ''
  const principles: string[] = []
  let footer = ''

  let subtitleLines: string[] = []
  let inSubtitle = false
  let subtitleDone = false

  for (const line of lines) {
    // H1 → title
    if (!title && line.startsWith('# ')) {
      title = line.slice(2).trim()
      inSubtitle = true
      continue
    }

    // blockquote → footer
    if (line.startsWith('>')) {
      const stripped = line.replace(/^>\s*/, '').replace(/^\*\s*/, '').trim()
      if (stripped) footer = stripped
      continue
    }

    // ordered list → principles
    if (/^\d+\.\s/.test(line)) {
      if (!subtitleDone && subtitleLines.length > 0) {
        subtitle = subtitleLines.join('\n')
        subtitleLines = []
      }
      subtitleDone = true
      inSubtitle = false
      const text = line.replace(/^\d+\.\s/, '').trim()
      if (text) principles.push(text)
      continue
    }

    // subtitle 수집 (H1 이후, ordered list 이전, 비어있지 않은 줄)
    if (inSubtitle && !subtitleDone && title) {
      if (line.trim() === '') {
        if (subtitleLines.length > 0) {
          inSubtitle = false
          subtitleDone = true
          subtitle = subtitleLines.join('\n')
          subtitleLines = []
        }
      } else if (!line.startsWith('#')) {
        subtitleLines.push(line.trim())
      }
    }
  }

  // 루프 종료 후에도 subtitleLines가 남아있으면 flush
  if (subtitleLines.length > 0 && !subtitle) {
    subtitle = subtitleLines.join('\n')
  }

  return { title, subtitle, principles, footer }
}
