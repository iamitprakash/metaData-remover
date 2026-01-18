import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconMail, IconCopy, IconCheck, IconX } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

const disposableEmailDomains = [
  'tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
  'throwaway.email', 'temp-mail.org', 'getnada.com', 'mohmal.com',
];

export const EmailValidator = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const { showToast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);
    
    if (!isValidFormat) {
      return {
        valid: false,
        format: false,
        message: 'Invalid email format',
      };
    }

    const [local, domain] = email.toLowerCase().split('@');
    const isDisposable = disposableEmailDomains.some(d => domain.includes(d));
    
    const checks = {
      valid: true,
      format: true,
      local: local.length > 0 && local.length <= 64,
      domain: domain.length > 0 && domain.length <= 255,
      hasDot: domain.includes('.'),
      disposable: isDisposable,
      message: isDisposable ? 'Email uses a disposable domain' : 'Email appears valid',
    };

    return checks;
  };

  const handleValidate = () => {
    if (!email.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    const validation = validateEmail(email);
    setResult({
      email,
      ...validation,
    });
    
    if (validation.valid && 'disposable' in validation) {
      showToast(validation.disposable ? 'Email validated (disposable detected)' : 'Email validated');
    } else {
      showToast('Invalid email format', 'error');
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
            <IconMail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Email Validator
          </h1>
          <p className="text-muted-foreground">Validate email addresses and detect disposable emails</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
              />
              <button
                onClick={handleValidate}
                disabled={!email.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Validate
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-background border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Validation Results</h3>
                <button
                  onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  title="Copy"
                >
                  <IconCopy className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {result.valid ? (
                    <IconCheck className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <IconX className="w-5 h-5 text-destructive" />
                  )}
                  <div>
                    <span className="font-medium">Format:</span>
                    <span className={`ml-2 ${result.format ? 'text-emerald-500' : 'text-destructive'}`}>
                      {result.format ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                </div>

                {result.valid && 'local' in result && (
                  <>
                    <div className="flex items-center gap-3">
                      <IconCheck className="w-5 h-5 text-emerald-500" />
                      <div>
                        <span className="font-medium">Local Part:</span>
                        <span className={`ml-2 ${result.local ? 'text-emerald-500' : 'text-destructive'}`}>
                          {result.local ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {result.disposable ? (
                        <IconX className="w-5 h-5 text-amber-500" />
                      ) : (
                        <IconCheck className="w-5 h-5 text-emerald-500" />
                      )}
                      <div>
                        <span className="font-medium">Disposable Domain:</span>
                        <span className={`ml-2 ${result.disposable ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {result.disposable ? 'Yes (disposable)' : 'No'}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium">{result.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
