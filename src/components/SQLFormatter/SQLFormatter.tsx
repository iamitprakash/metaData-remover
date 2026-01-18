import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCode, IconCopy } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

const formatSQL = (sql: string): string => {
  let formatted = sql.trim();
  
  // Keywords to uppercase
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
    'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'LIKE', 'BETWEEN', 'IS', 'NULL',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
    'ALTER', 'DROP', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE',
    'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT',
    'UNION', 'ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COUNT', 'SUM',
    'AVG', 'MAX', 'MIN', 'CAST', 'CONVERT', 'IF', 'NULLIF', 'COALESCE',
  ];

  // Replace keywords (case-insensitive)
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, keyword);
  });

  // Add newlines after major clauses
  formatted = formatted.replace(/\b(SELECT|FROM|WHERE|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|ORDER BY|GROUP BY|HAVING|LIMIT|UNION|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/gi, '\n$1');
  
  // Add newlines before AND/OR in WHERE clauses
  formatted = formatted.replace(/\s+(AND|OR)\s+/gi, '\n  $1 ');
  
  // Add indentation for subqueries
  formatted = formatted.replace(/\(\s*(SELECT)/gi, '(\n    $1');
  
  // Clean up multiple newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // Add proper indentation
  const lines = formatted.split('\n');
  let indent = 0;
  const indentedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    
    // Decrease indent for closing parentheses
    if (trimmed.startsWith(')')) {
      indent = Math.max(0, indent - 2);
    }
    
    const indented = ' '.repeat(indent) + trimmed;
    
    // Increase indent for opening parentheses
    if (trimmed.includes('(') && !trimmed.includes(')')) {
      indent += 2;
    }
    
    return indented;
  });

  return indentedLines.filter(l => l).join('\n').trim();
};

export const SQLFormatter = () => {
  const [sql, setSql] = useState('');
  const [formatted, setFormatted] = useState('');
  const { showToast } = useToast();

  const handleFormat = () => {
    if (!sql.trim()) {
      showToast('Please enter a SQL query', 'error');
      return;
    }

    try {
      const formattedSQL = formatSQL(sql);
      setFormatted(formattedSQL);
      showToast('SQL query formatted successfully');
    } catch (err) {
      showToast('Failed to format SQL query', 'error');
      setFormatted('Error formatting SQL query');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <IconCode className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            SQL Formatter
          </h1>
          <p className="text-muted-foreground">Format and beautify SQL queries</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">SQL Query</label>
                {sql && (
                  <button
                    onClick={() => handleCopy(sql)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy query"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={sql}
                onChange={(e) => {
                  setSql(e.target.value);
                  setFormatted('');
                }}
                placeholder="SELECT * FROM users WHERE id = 1"
                className="w-full h-96 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
                spellCheck={false}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Formatted Query</label>
                {formatted && (
                  <button
                    onClick={() => handleCopy(formatted)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy formatted"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={formatted}
                readOnly
                placeholder="Formatted SQL will appear here..."
                className="w-full h-96 px-4 py-3 bg-muted/30 border border-border rounded-xl font-mono text-sm resize-none"
                spellCheck={false}
              />
            </div>
          </div>

          <button
            onClick={handleFormat}
            disabled={!sql.trim()}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Format SQL Query
          </button>
        </div>
      </motion.div>
    </div>
  );
};
