export function convertCSVToJSON(csv: string, hasHeaders: boolean = true): string {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return '[]';
  }
  
  const headers = hasHeaders ? lines[0].split(',').map(h => h.trim()) : [];
  const data: any[] = [];
  
  const startIndex = hasHeaders ? 1 : 0;
  for (let i = startIndex; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (hasHeaders) {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      data.push(obj);
    } else {
      data.push(values);
    }
  }
  
  return JSON.stringify(data, null, 2);
}

export function convertJSONToCSV(json: string, includeHeaders: boolean = true): string {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }
    
    const headers = includeHeaders ? Object.keys(data[0]) : [];
    const lines: string[] = [];
    
    if (includeHeaders && headers.length > 0) {
      lines.push(headers.join(','));
    }
    
    data.forEach((item: any) => {
      if (Array.isArray(item)) {
        lines.push(item.join(','));
      } else {
        const values = headers.map(header => {
          const value = item[header] ?? '';
          // Escape commas and quotes in values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        });
        lines.push(values.join(','));
      }
    });
    
    return lines.join('\n');
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}
