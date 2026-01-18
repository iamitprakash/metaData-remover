export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR = 'il1Lo0O';
const AMBIGUOUS = '{}[]()/\\\'"`~,;:.<>';

export function generatePassword(options: PasswordOptions): string {
  let charset = '';
  
  if (options.includeUppercase) {
    charset += UPPERCASE;
  }
  if (options.includeLowercase) {
    charset += LOWERCASE;
  }
  if (options.includeNumbers) {
    charset += NUMBERS;
  }
  if (options.includeSymbols) {
    charset += SYMBOLS;
  }
  
  if (charset.length === 0) {
    throw new Error('At least one character type must be selected');
  }
  
  // Remove similar characters if requested
  if (options.excludeSimilar) {
    charset = charset.split('').filter(char => !SIMILAR.includes(char)).join('');
  }
  
  // Remove ambiguous characters if requested
  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(char => !AMBIGUOUS.includes(char)).join('');
  }
  
  if (charset.length === 0) {
    throw new Error('No characters available after exclusions');
  }
  
  // Generate password
  const password = Array.from(crypto.getRandomValues(new Uint32Array(options.length)))
    .map(x => charset[x % charset.length])
    .join('');
  
  return password;
}

export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');
  
  if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  }
  
  let label: string;
  if (score <= 2) label = 'Weak';
  else if (score <= 4) label = 'Fair';
  else if (score <= 6) label = 'Good';
  else label = 'Strong';
  
  return { score, label, feedback };
}
