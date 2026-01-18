import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconWorld, IconCopy, IconSearch } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

const httpStatusCodes: Record<number, { name: string; description: string; category: string }> = {
  100: { name: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.', category: 'Informational' },
  101: { name: 'Switching Protocols', description: 'The requester has asked the server to switch protocols.', category: 'Informational' },
  200: { name: 'OK', description: 'The request has succeeded.', category: 'Success' },
  201: { name: 'Created', description: 'The request has been fulfilled and a new resource has been created.', category: 'Success' },
  202: { name: 'Accepted', description: 'The request has been accepted for processing.', category: 'Success' },
  204: { name: 'No Content', description: 'The server successfully processed the request but is not returning any content.', category: 'Success' },
  301: { name: 'Moved Permanently', description: 'The requested resource has been permanently moved to a new URL.', category: 'Redirection' },
  302: { name: 'Found', description: 'The requested resource has been temporarily moved to a new URL.', category: 'Redirection' },
  304: { name: 'Not Modified', description: 'The resource has not been modified since the last request.', category: 'Redirection' },
  400: { name: 'Bad Request', description: 'The server cannot process the request due to a client error.', category: 'Client Error' },
  401: { name: 'Unauthorized', description: 'Authentication is required to access this resource.', category: 'Client Error' },
  403: { name: 'Forbidden', description: 'The server understood the request but refuses to authorize it.', category: 'Client Error' },
  404: { name: 'Not Found', description: 'The requested resource could not be found.', category: 'Client Error' },
  405: { name: 'Method Not Allowed', description: 'The request method is not allowed for this resource.', category: 'Client Error' },
  408: { name: 'Request Timeout', description: 'The server timed out waiting for the request.', category: 'Client Error' },
  409: { name: 'Conflict', description: 'The request conflicts with the current state of the resource.', category: 'Client Error' },
  429: { name: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time.', category: 'Client Error' },
  500: { name: 'Internal Server Error', description: 'The server encountered an unexpected condition.', category: 'Server Error' },
  501: { name: 'Not Implemented', description: 'The server does not support the functionality required to fulfill the request.', category: 'Server Error' },
  502: { name: 'Bad Gateway', description: 'The server received an invalid response from an upstream server.', category: 'Server Error' },
  503: { name: 'Service Unavailable', description: 'The server is temporarily unable to handle the request.', category: 'Server Error' },
  504: { name: 'Gateway Timeout', description: 'The server did not receive a timely response from an upstream server.', category: 'Server Error' },
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Informational': return 'text-blue-500 bg-blue-500/10';
    case 'Success': return 'text-emerald-500 bg-emerald-500/10';
    case 'Redirection': return 'text-amber-500 bg-amber-500/10';
    case 'Client Error': return 'text-red-500 bg-red-500/10';
    case 'Server Error': return 'text-orange-500 bg-orange-500/10';
    default: return 'text-muted-foreground bg-muted';
  }
};

export const HTTPStatusLookup = () => {
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState<number | null>(null);
  const { showToast } = useToast();

  const filteredCodes = Object.entries(httpStatusCodes).filter(([code, info]) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      code.includes(search) ||
      info.name.toLowerCase().includes(searchLower) ||
      info.description.toLowerCase().includes(searchLower) ||
      info.category.toLowerCase().includes(searchLower)
    );
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <IconWorld className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            HTTP Status Code Lookup
          </h1>
          <p className="text-muted-foreground">Reference for HTTP status codes</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, name, or description..."
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredCodes.map(([code, info]) => (
              <button
                key={code}
                onClick={() => setSelectedCode(parseInt(code, 10))}
                className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  selectedCode === parseInt(code, 10)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-background'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-2xl font-bold">{code}</div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getCategoryColor(info.category)}`}>
                      {info.category}
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-sm mb-1">{info.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{info.description}</div>
              </button>
            ))}
          </div>

          {selectedCode && httpStatusCodes[selectedCode] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background border border-border rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold mb-2">{selectedCode}</div>
                  <div className="text-xl font-semibold mb-1">{httpStatusCodes[selectedCode].name}</div>
                  <div className={`text-xs px-3 py-1 rounded-full inline-block ${getCategoryColor(httpStatusCodes[selectedCode].category)}`}>
                    {httpStatusCodes[selectedCode].category}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(`${selectedCode} ${httpStatusCodes[selectedCode].name}`)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  title="Copy"
                >
                  <IconCopy className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-muted-foreground">
                {httpStatusCodes[selectedCode].description}
              </div>
            </motion.div>
          )}

          {filteredCodes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No status codes found matching your search.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
