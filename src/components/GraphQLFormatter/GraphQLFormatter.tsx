import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCode, IconCopy } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

const formatGraphQL = (query: string): string => {
  let formatted = query.trim();
  let indent = 0;
  const indentSize = 2;
  const result: string[] = [];
  let inString = false;
  let stringChar = '';
  let i = 0;

  while (i < formatted.length) {
    const char = formatted[i];
    const prevChar = i > 0 ? formatted[i - 1] : '';

    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }

    if (inString) {
      result.push(char);
      i++;
      continue;
    }

    if (char === '{' || char === '(' || char === '[') {
      result.push(char);
      indent += indentSize;
      result.push('\n' + ' '.repeat(indent));
      i++;
      continue;
    }

    if (char === '}' || char === ')' || char === ']') {
      indent = Math.max(0, indent - indentSize);
      result.push('\n' + ' '.repeat(indent) + char);
      i++;
      continue;
    }

    if (char === ',') {
      result.push(char);
      result.push('\n' + ' '.repeat(indent));
      i++;
      continue;
    }

    if (char === ' ' || char === '\n' || char === '\t') {
      if (result[result.length - 1] !== '\n' && result[result.length - 1] !== ' ') {
        result.push(' ');
      }
      i++;
      continue;
    }

    result.push(char);
    i++;
  }

  return result.join('').replace(/\n\s*\n/g, '\n').trim();
};

export const GraphQLFormatter = () => {
  const [query, setQuery] = useState('');
  const [formatted, setFormatted] = useState('');
  const { showToast } = useToast();

  const handleFormat = () => {
    if (!query.trim()) {
      showToast('Please enter a GraphQL query', 'error');
      return;
    }

    try {
      const formattedQuery = formatGraphQL(query);
      setFormatted(formattedQuery);
      showToast('Query formatted successfully');
    } catch (err) {
      showToast('Failed to format query', 'error');
      setFormatted('Error formatting query');
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
            GraphQL Formatter
          </h1>
          <p className="text-muted-foreground">Format and beautify GraphQL queries</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">GraphQL Query</label>
                {query && (
                  <button
                    onClick={() => handleCopy(query)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy query"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setFormatted('');
                }}
                placeholder="query { user(id: 1) { name email } }"
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
                placeholder="Formatted query will appear here..."
                className="w-full h-96 px-4 py-3 bg-muted/30 border border-border rounded-xl font-mono text-sm resize-none"
                spellCheck={false}
              />
            </div>
          </div>

          <button
            onClick={handleFormat}
            disabled={!query.trim()}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Format GraphQL Query
          </button>
        </div>
      </motion.div>
    </div>
  );
};
