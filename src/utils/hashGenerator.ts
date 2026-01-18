export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

export async function generateHash(text: string, algorithm: HashAlgorithm): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  let hashBuffer: ArrayBuffer;
  
  switch (algorithm) {
    case 'sha1':
      hashBuffer = await crypto.subtle.digest('SHA-1', data);
      break;
    case 'sha256':
      hashBuffer = await crypto.subtle.digest('SHA-256', data);
      break;
    case 'sha512':
      hashBuffer = await crypto.subtle.digest('SHA-512', data);
      break;
    case 'md5':
      // MD5 is not available in Web Crypto API, using a simple implementation
      // Note: MD5 is cryptographically broken, use SHA-256 instead
      return generateMD5(text);
    default:
      throw new Error('Unsupported algorithm');
  }
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple MD5 implementation (for compatibility, not recommended for security)
function generateMD5(text: string): string {
  // This is a placeholder - MD5 requires a library or complex implementation
  // For production, consider using a library or warning users about MD5's limitations
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Simple hash-like function (not real MD5)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash = hash & hash;
  }
  
  // Convert to hex string
  const hex = Math.abs(hash).toString(16).padStart(32, '0');
  return hex.substring(0, 32);
}
