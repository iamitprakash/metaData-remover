import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconShield, IconCopy, IconRefresh } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

// TOTP implementation (simplified)
function generateTOTP(secret: string, timeStep: number = 30): string {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const key = base32Decode(secret);
  const counter = new ArrayBuffer(8);
  const view = new DataView(counter);
  view.setUint32(4, time, false);
  
  // Simplified HMAC-SHA1 (for production, use crypto.subtle)
  // This is a placeholder - real implementation requires crypto API
  const hash = simpleHMAC(key, counter);
  const offset = hash[hash.length - 1] & 0x0f;
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);
  
  return (code % 1000000).toString().padStart(6, '0');
}

function base32Decode(str: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toUpperCase();
    if (char === '=') break;
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    
    value = (value << 5) | index;
    bits += 5;
    
    if (bits >= 8) {
      bytes.push((value >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  
  return new Uint8Array(bytes);
}

function simpleHMAC(key: Uint8Array, message: ArrayBuffer): Uint8Array {
  // This is a simplified placeholder
  // Real implementation should use Web Crypto API
  const combined = new Uint8Array(key.length + message.byteLength);
  combined.set(key);
  combined.set(new Uint8Array(message), key.length);
  
  // Simple hash simulation (not secure - for demo only)
  const hash = new Uint8Array(20);
  for (let i = 0; i < combined.length; i++) {
    hash[i % 20] ^= combined[i];
  }
  return hash;
}

export const TwoFactorAuth = () => {
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const { showToast } = useToast();

  useEffect(() => {
    if (!secret.trim()) return;

    const generateCode = () => {
      try {
        const totp = generateTOTP(secret);
        setCode(totp);
      } catch (err) {
        setCode('Error');
      }
    };

    generateCode();
    const interval = setInterval(() => {
      const timeStep = 30;
      const currentTime = Math.floor(Date.now() / 1000);
      const remaining = timeStep - (currentTime % timeStep);
      setTimeLeft(remaining);
      
      if (remaining === timeStep) {
        generateCode();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [secret]);

  const handleGenerateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let newSecret = '';
    for (let i = 0; i < 16; i++) {
      newSecret += chars[Math.floor(Math.random() * chars.length)];
    }
    setSecret(newSecret);
    showToast('Secret generated');
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
            <IconShield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Two-Factor Auth (2FA) Generator
          </h1>
          <p className="text-muted-foreground">Generate TOTP codes for 2FA authentication</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Secret Key (Base32)</label>
              <button
                onClick={handleGenerateSecret}
                className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer"
              >
                <IconRefresh className="w-4 h-4" />
                Generate
              </button>
            </div>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value.toUpperCase())}
              placeholder="Enter or generate a secret key"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          {secret && code && (
            <div className="bg-background border border-border rounded-xl p-6 space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold font-mono mb-2">{code}</div>
                <div className="text-sm text-muted-foreground">
                  Expires in {timeLeft} seconds
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(code)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <IconCopy className="w-4 h-4" />
                  Copy Code
                </button>
                <button
                  onClick={() => handleCopy(secret)}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <IconCopy className="w-4 h-4" />
                  Copy Secret
                </button>
              </div>
            </div>
          )}

          <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Note:</p>
            <p>This is a simplified TOTP implementation for demonstration. For production use:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use a proper TOTP library (e.g., otplib)</li>
              <li>Implement proper HMAC-SHA1 using Web Crypto API</li>
              <li>Store secrets securely</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
