import type {Block} from './Block'


export function generateBlocksFromText(text: string, startIndex = 0): Block[] {

  if (!text) return []

  const paragraphs = text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)

  return paragraphs.map((para, i) => {
    const lines = para.split(/\n/).map(l => l.trim()).filter(Boolean)
    let titre = ''
    let description = 'Veuillez éditer ce texte pour modifier le contenu du bloc.'

    const first = lines[0] ?? ''

    if (lines.length === 0) {
      titre = 'Étape'
      description = 'Veuillez éditer ce texte pour modifier le contenu du bloc.'
    } else {
      const colonIdx = first.indexOf(':')
      if (colonIdx > 0) {
        titre = first.slice(0, colonIdx).trim()
        const restFirst = first.slice(colonIdx + 1).trim()
        description = [restFirst, ...lines.slice(1)].filter(Boolean).join('\n')
      } else if (first.startsWith('# ')) {
        titre = first.replace(/^#\s+/, '').trim()
        description = lines.slice(1).join('\n')
      } else {
        titre = first
        description = lines.slice(1).join('\n')
      }
    }

    return {
      numero: startIndex + i + 1,
      titre,
      description,
      texteBouton: 'Cliquer ici',
    }
  })
}
