import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCode, IconCopy } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const CurlGenerator = () => {
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [body, setBody] = useState('');
  const [curlCommand, setCurlCommand] = useState('');
  const { showToast } = useToast();

  const generateCurl = () => {
    if (!url.trim()) {
      showToast('Please enter a URL', 'error');
      return;
    }

    let command = `curl -X ${method}`;

    // Add headers
    headers.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        command += ` \\\n  -H "${key}: ${value}"`;
      }
    });

    // Add default Content-Type if POST/PUT/PATCH and not specified
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const hasContentType = headers.some(h => h.key.toLowerCase() === 'content-type');
      if (!hasContentType) {
        command += ` \\\n  -H "Content-Type: application/json"`;
      }
    }

    // Add body
    if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
      try {
        // Try to format JSON if valid
        const parsed = JSON.parse(body);
        const formatted = JSON.stringify(parsed, null, 2);
        command += ` \\\n  -d '${formatted.replace(/'/g, "'\\''")}'`;
      } catch {
        // Not JSON, use as-is
        command += ` \\\n  -d '${body.replace(/'/g, "'\\''")}'`;
      }
    }

    // Add URL
    command += ` \\\n  "${url}"`;

    setCurlCommand(command);
    showToast('cURL command generated');
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
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
            cURL Command Generator
          </h1>
          <p className="text-muted-foreground">Generate cURL commands from API requests</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Headers</label>
              <button
                onClick={handleAddHeader}
                className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Add Header
              </button>
            </div>
            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                    placeholder="Header name"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    placeholder="Header value"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <button
                    onClick={() => handleRemoveHeader(index)}
                    className="px-3 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div>
              <label className="block text-sm font-medium mb-2">Request Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full h-32 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
              />
            </div>
          )}

          <button
            onClick={generateCurl}
            disabled={!url.trim()}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Generate cURL Command
          </button>

          {curlCommand && (
            <div className="bg-background border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">cURL Command</h3>
                <button
                  onClick={() => handleCopy(curlCommand)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  title="Copy"
                >
                  <IconCopy className="w-4 h-4" />
                </button>
              </div>
              <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                {curlCommand}
              </pre>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
