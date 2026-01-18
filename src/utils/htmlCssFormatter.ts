export function formatHTML(html: string, indent: number = 2): string {
  let formatted = '';
  let indentLevel = 0;
  const indentStr = ' '.repeat(indent);
  
  // Simple HTML formatter
  const regex = /(<\/?[^>]+>)/g;
  const parts = html.split(regex);
  
  for (const part of parts) {
    if (!part.trim()) continue;
    
    if (part.startsWith('</')) {
      indentLevel = Math.max(0, indentLevel - 1);
      formatted += indentStr.repeat(indentLevel) + part + '\n';
    } else if (part.startsWith('<') && !part.endsWith('/>')) {
      formatted += indentStr.repeat(indentLevel) + part + '\n';
      if (!part.match(/<(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)[^>]*>/i)) {
        indentLevel++;
      }
    } else if (part.startsWith('<') && part.endsWith('/>')) {
      formatted += indentStr.repeat(indentLevel) + part + '\n';
    } else {
      const trimmed = part.trim();
      if (trimmed) {
        formatted += indentStr.repeat(indentLevel) + trimmed + '\n';
      }
    }
  }
  
  return formatted.trim();
}

export function minifyHTML(html: string): string {
  return html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatCSS(css: string, indent: number = 2): string {
  let formatted = '';
  let indentLevel = 0;
  const indentStr = ' '.repeat(indent);
  
  css = css.replace(/\s*{\s*/g, ' {\n');
  css = css.replace(/;\s*/g, ';\n');
  css = css.replace(/\s*}\s*/g, '\n}\n');
  css = css.replace(/\s*,\s*/g, ', ');
  
  const lines = css.split('\n');
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    if (line.endsWith('{')) {
      formatted += indentStr.repeat(indentLevel) + line + '\n';
      indentLevel++;
    } else if (line.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
      formatted += indentStr.repeat(indentLevel) + line + '\n';
    } else {
      formatted += indentStr.repeat(indentLevel) + line + '\n';
    }
  }
  
  return formatted.trim();
}

export function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*,\s*/g, ',')
    .trim();
}
