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

function parseRepeats(value?: string): number {
  const raw = (value ?? '').replace(',', '.').trim();
  if (!raw) return 1;

  const fraction = raw.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)/);
  if (fraction && fraction[1] !== undefined && fraction[2] !== undefined) {
    const numerator = parseFloat(fraction[1]);
    const denominator = parseFloat(fraction[2]);
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
  }

  const asNumber = parseFloat(raw);
  return Number.isFinite(asNumber) ? asNumber : 1;
}

function splitRow(line: string): string[] {
  return line.split('\t').map(cell => cell.trim());
}

export function generateBlocksFromClipboardTable(text: string): Block[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const lines = normalized.split('\n').map(line => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const firstLine = lines[0] ?? '';
  const hasHeader = /num[eé]ro/i.test(firstLine) && /libell/i.test(firstLine);
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const blocks: Block[] = [];
  if (dataLines.length === 1) {
    const cells = splitRow(dataLines[0] ?? '');
    for (let i = 0; i < cells.length; i += 3) {
      const rawStep = cells[i];
      const rawLabel = cells[i + 1];
      const rawRepeats = cells[i + 2];

      const title = (rawLabel ?? '').trim();
      if (!title) continue;

      const parsedStep = parseInt(rawStep ?? '', 10);
      const step = Number.isFinite(parsedStep) ? parsedStep : Math.floor(i / 3) + 1;
      const nbOfRepeats = parseRepeats(rawRepeats);

      blocks.push({
        id: Date.now() + i,
        text: title,
        step,
        nbOfRepeats,
        images: [],
        modified: true,
      });
    }
  } else {
    // Multiligne: chaque ligne = un bloc
    dataLines.forEach((line, idx) => {
      const cells = splitRow(line);
      if (cells.length < 2) return;

      const [rawStep, rawLabel, rawRepeats] = cells;
      const title = (rawLabel ?? '').trim();
      if (!title) return;

      const parsedStep = parseInt(rawStep ?? '', 10);
      const step = Number.isFinite(parsedStep) ? parsedStep : idx + 1;
      const nbOfRepeats = parseRepeats(rawRepeats);

      blocks.push({
        id: Date.now() + idx,
        text: title,
        step,
        nbOfRepeats,
        images: [],
        modified: true,
      });
    });
  }

  return blocks;
}