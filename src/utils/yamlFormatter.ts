export function formatYAML(yaml: string, indent: number = 2): string {
  try {
    // Simple YAML formatting - for full support, use a library like js-yaml
    const lines = yaml.split('\n');
    const formatted: string[] = [];
    let currentIndent = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        formatted.push(line);
        continue;
      }
      
      // Decrease indent if line starts with closing patterns
      if (trimmed.startsWith('-') || trimmed.match(/^[a-zA-Z0-9_-]+:/)) {
        // Keep current indent
      } else if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
        currentIndent = Math.max(0, currentIndent - indent);
      }
      
      formatted.push(' '.repeat(currentIndent) + trimmed);
      
      // Increase indent for next level
      if (trimmed.endsWith(':') || trimmed.endsWith('-')) {
        currentIndent += indent;
      }
    }
    
    return formatted.join('\n');
  } catch (error) {
    throw new Error('Failed to format YAML');
  }
}

export function validateYAML(yaml: string): { valid: boolean; error?: string } {
  try {
    // Basic YAML validation
    const lines = yaml.split('\n');
    let openBrackets = 0;
    let openBraces = 0;
    
    for (const line of lines) {
      for (const char of line) {
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
      }
    }
    
    if (openBrackets !== 0 || openBraces !== 0) {
      return {
        valid: false,
        error: 'Unmatched brackets or braces'
      };
    }
    
    // Check for basic YAML structure
    const hasContent = lines.some(line => line.trim() && !line.trim().startsWith('#'));
    if (!hasContent) {
      return {
        valid: false,
        error: 'YAML appears to be empty'
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid YAML'
    };
  }
}
