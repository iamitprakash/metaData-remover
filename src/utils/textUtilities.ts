export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
}

export function getTextStats(text: string): TextStats {
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0,
    paragraphs: text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0,
    lines: text.split('\n').length,
  };
}

export function convertCase(text: string, caseType: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'kebab' | 'snake'): string {
  switch (caseType) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    case 'sentence':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'camel':
      return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      ).replace(/\s+/g, '');
    case 'pascal':
      return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
        word.toUpperCase()
      ).replace(/\s+/g, '');
    case 'kebab':
      return text.toLowerCase().replace(/\s+/g, '-');
    case 'snake':
      return text.toLowerCase().replace(/\s+/g, '_');
    default:
      return text;
  }
}

export function removeDuplicates(text: string, byLine: boolean = false): string {
  if (byLine) {
    const lines = text.split('\n');
    const unique = Array.from(new Set(lines));
    return unique.join('\n');
  } else {
    const words = text.split(/\s+/);
    const unique = Array.from(new Set(words));
    return unique.join(' ');
  }
}

export function reverseText(text: string, byLine: boolean = false): string {
  if (byLine) {
    return text.split('\n').reverse().join('\n');
  } else {
    return text.split('').reverse().join('');
  }
}

export function sortLines(text: string, ascending: boolean = true): string {
  const lines = text.split('\n');
  lines.sort((a, b) => {
    const comparison = a.localeCompare(b);
    return ascending ? comparison : -comparison;
  });
  return lines.join('\n');
}
