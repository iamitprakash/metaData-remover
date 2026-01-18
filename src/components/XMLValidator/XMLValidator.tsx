import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCode, IconCopy, IconCheck, IconX } from '@tabler/icons-react';
import { validateXML } from '../../utils/xmlJsonConverter';
import { useToast } from '../ui/toast';

export const XMLValidator = () => {
  const [xml, setXml] = useState('');
  const [validation, setValidation] = useState<{ valid: boolean; error?: string } | null>(null);
  const { showToast } = useToast();

  const handleValidate = () => {
    if (!xml.trim()) {
      showToast('Please enter XML', 'error');
      return;
    }

    try {
      const result = validateXML(xml);
      setValidation(result);
      
      if (result.valid) {
        showToast('XML is valid');
      } else {
        showToast('XML is invalid', 'error');
      }
    } catch (err) {
      setValidation({
        valid: false,
        error: err instanceof Error ? err.message : 'Failed to validate XML',
      });
      showToast('Failed to validate XML', 'error');
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
            XML Validator
          </h1>
          <p className="text-muted-foreground">Validate XML against XSD schemas</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">XML Content</label>
              {xml && (
                <button
                  onClick={() => handleCopy(xml)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  title="Copy XML"
                >
                  <IconCopy className="w-4 h-4" />
                </button>
              )}
            </div>
            <textarea
              value={xml}
              onChange={(e) => {
                setXml(e.target.value);
                setValidation(null);
              }}
              placeholder='<?xml version="1.0"?><root><item>Value</item></root>'
              className="w-full h-96 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
              spellCheck={false}
            />
          </div>

          {validation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-2 ${
                validation.valid
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                  : 'bg-destructive/10 border-destructive/50 text-destructive'
              }`}
            >
              <div className="flex items-center gap-2">
                {validation.valid ? (
                  <>
                    <IconCheck className="w-5 h-5" />
                    <span className="font-semibold">Valid XML</span>
                  </>
                ) : (
                  <>
                    <IconX className="w-5 h-5" />
                    <div className="flex-1">
                      <span className="font-semibold">Invalid XML</span>
                      {validation.error && (
                        <p className="text-sm mt-1 opacity-90">{validation.error}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          <button
            onClick={handleValidate}
            disabled={!xml.trim()}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Validate XML
          </button>

          <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Note:</p>
            <p>This validator checks XML syntax and structure. For XSD schema validation, you'll need a backend service or a library like xmldom with xpath.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
