import type { Block } from './Blocks'; 

export function generateBlocksFromText(text: string, startIndex = 0): Block[] {
  if (!text) return [];

  const paragraphs = text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  return paragraphs.map((para, i) => {
    const lines = para.split(/\n/).map(l => l.trim()).filter(Boolean);
    
    let blockText = 'Veuillez éditer ce texte pour modifier le contenu du bloc.';

    if (lines.length > 0) {
      const first = lines[0] ?? '';
      const colonIdx = first.indexOf(':');

      if (colonIdx > 0) {

        const restFirst = first.slice(colonIdx + 1).trim();
        blockText = [restFirst, ...lines.slice(1)].filter(Boolean).join('\n');
      } else if (first.startsWith('# ')) {

        blockText = lines.slice(1).join('\n');
      } else {

        blockText = lines.join('\n');
      }
    }


    return {
      id: Date.now() + i, 
      text: blockText,    
      step: startIndex + i + 1, 
      nbOfRepeats: 1,     
      images: [],         
      modified: true
    };
  });
}