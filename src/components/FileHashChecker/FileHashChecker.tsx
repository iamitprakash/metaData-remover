import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconFile, IconCopy } from '@tabler/icons-react';
import { FileUpload } from '../ui/file-upload';
import { generateHash, type HashAlgorithm } from '../../utils/hashGenerator';
import { useToast } from '../ui/toast';

export const FileHashChecker = () => {
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('sha256');
  const [hash, setHash] = useState('');
  const [expectedHash, setExpectedHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { showToast } = useToast();

  const algorithms: { value: HashAlgorithm; label: string }[] = [
    { value: 'md5', label: 'MD5' },
    { value: 'sha1', label: 'SHA-1' },
    { value: 'sha256', label: 'SHA-256' },
    { value: 'sha512', label: 'SHA-512' },
  ];

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setHash('');
    }
  };

  const handleCalculate = async () => {
    if (!file) {
      showToast('Please select a file', 'error');
      return;
    }

    try {
      const fileContent = await file.arrayBuffer();
      const result = await generateHash(new TextDecoder().decode(fileContent), algorithm);
      setHash(result);
      showToast('Hash calculated successfully');
    } catch (err) {
      showToast('Failed to calculate hash', 'error');
    }
  };

  const handleVerify = async () => {
    if (!file || !expectedHash.trim()) {
      showToast('Please select a file and enter expected hash', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      const fileContent = await file.arrayBuffer();
      const calculatedHash = await generateHash(new TextDecoder().decode(fileContent), algorithm);
      const match = calculatedHash.toLowerCase() === expectedHash.trim().toLowerCase();
      
      if (match) {
        showToast('Hash matches! File is verified');
      } else {
        showToast('Hash does not match! File may be corrupted', 'error');
      }
      
      setHash(calculatedHash);
    } catch (err) {
      showToast('Failed to verify hash', 'error');
    } finally {
      setIsVerifying(false);
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
            <IconFile className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            File Hash Checker
          </h1>
          <p className="text-muted-foreground">Calculate and verify file checksums (MD5, SHA256, etc.)</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          {!file ? (
            <FileUpload onChange={handleFileSelect} isProcessing={false} />
          ) : (
            <>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setHash('');
                      setExpectedHash('');
                    }}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Algorithm</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {algorithms.map((alg) => (
                    <button
                      key={alg.value}
                      onClick={() => setAlgorithm(alg.value)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                        algorithm === alg.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {alg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCalculate}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all cursor-pointer"
                >
                  Calculate Hash
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expected Hash (for verification)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={expectedHash}
                    onChange={(e) => setExpectedHash(e.target.value)}
                    placeholder="Paste expected hash to verify..."
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying || !expectedHash.trim()}
                    className="px-6 py-2 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>

              {hash && (
                <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Calculated Hash</h3>
                    <button
                      onClick={() => handleCopy(hash)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                      title="Copy"
                    >
                      <IconCopy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 font-mono text-sm break-all">
                    {hash}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
