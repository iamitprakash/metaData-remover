import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCode, IconCopy } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

const evaluateJSONPath = (json: any, path: string): any => {
  if (!path.trim()) return json;

  const parts = path.split(/[\.\[\]]/).filter(p => p && p !== '');
  let result = json;

  for (const part of parts) {
    if (result === null || result === undefined) {
      return null;
    }

    // Handle array indices
    if (/^\d+$/.test(part)) {
      const index = parseInt(part, 10);
      if (Array.isArray(result) && index >= 0 && index < result.length) {
        result = result[index];
      } else {
        return null;
      }
    } else {
      // Handle object properties
      if (typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return null;
      }
    }
  }

  return result;
};

export const JSONPathFinder = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [path, setPath] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleExtract = () => {
    if (!jsonInput.trim()) {
      showToast('Please enter JSON', 'error');
      return;
    }

    if (!path.trim()) {
      showToast('Please enter a JSONPath expression', 'error');
      return;
    }

    try {
      setError('');
      const parsed = JSON.parse(jsonInput);
      const extracted = evaluateJSONPath(parsed, path);
      
      if (extracted === null || extracted === undefined) {
        setError('Path not found or invalid');
        setResult(null);
      } else {
        setResult(extracted);
        showToast('Data extracted successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setResult(null);
      showToast('Invalid JSON', 'error');
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
            JSON Path Finder
          </h1>
          <p className="text-muted-foreground">Extract data from JSON using JSONPath expressions</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">JSONPath Expression</label>
            <input
              type="text"
              value={path}
              onChange={(e) => {
                setPath(e.target.value);
                setResult(null);
                setError('');
              }}
              placeholder="users[0].name or data.items[1].value"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleExtract()}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Examples: users[0].name, data.items[1].value, config.database.host
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">JSON Input</label>
                {jsonInput && (
                  <button
                    onClick={() => handleCopy(jsonInput)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy JSON"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setResult(null);
                  setError('');
                }}
                placeholder='{"users": [{"name": "John", "age": 30}]}'
                className="w-full h-96 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
                spellCheck={false}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Extracted Result</label>
                {result !== null && (
                  <button
                    onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy result"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={result !== null ? JSON.stringify(result, null, 2) : error || ''}
                readOnly
                placeholder="Extracted data will appear here..."
                className={`w-full h-96 px-4 py-3 border border-border rounded-xl font-mono text-sm resize-none ${
                  error ? 'bg-destructive/10 text-destructive' : 'bg-muted/30'
                }`}
                spellCheck={false}
              />
            </div>
          </div>

          <button
            onClick={handleExtract}
            disabled={!jsonInput.trim() || !path.trim()}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Extract Data
          </button>
        </div>
      </motion.div>
    </div>
  );
};
