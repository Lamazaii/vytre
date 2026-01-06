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
  // Parse la colonne "Nombre" pour obtenir un nombre de répétitions:
  // - accepte les décimaux (1.5 ou 1,5)
  // - accepte les fractions du type "1/3" et retourne le quotient
  // - retourne 1 si la valeur est vide ou invalide
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
  // Coupe une ligne en cellules par tabulation (collage Excel/Sheets).
  // On NE filtre pas les cellules vides pour conserver l'alignement des colonnes.
  // Format attendu: Numéro \t Libellé \t Nombre \t ... (autres colonnes ignorées)
  // IMPORTANT: Ne pas utiliser de fallback sur espaces, sinon les espaces du Libellé décalent les colonnes.
  return line.split('\t').map(cell => cell.trim());
}

export function generateBlocksFromClipboardTable(text: string): Block[] {
  // Génère une liste de blocs à partir de données collées (format simple).
  // Format attendu (3 colonnes séparées par tabulation):
  //   Numéro \t Libellé \t Répétitions
  // Exemple multiligne:
  //   1	Etape 1	1
  //   2	Etape 2	5
  //   3	Etape 3	4
  // Ou sur une seule ligne (détecté automatiquement):
  //   1	Etape 1	1	2	Etape 2	5	3	Etape 3	4
  // Colonnes supplémentaires (Périodicité, Fréquence, etc.) sont ignorées.
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const lines = normalized.split('\n').map(line => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const firstLine = lines[0] ?? '';
  const hasHeader = /num[eé]ro/i.test(firstLine) && /libell/i.test(firstLine);
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const blocks: Block[] = [];

  // Si une seule ligne avec beaucoup de cellules, on regroupe par 3 (num, label, reps)
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