export type UUIDVersion = 'v1' | 'v4';

export function generateUUID(version: UUIDVersion = 'v4'): string {
  if (version === 'v4') {
    return generateUUIDv4();
  } else {
    return generateUUIDv1();
  }
}

function generateUUIDv4(): string {
  // Generate UUID v4 (random)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateUUIDv1(): string {
  // Simplified UUID v1 (timestamp-based)
  // Note: Full v1 implementation requires MAC address and proper timestamp handling
  const timestamp = Date.now();
  const random = Math.random().toString(16).substring(2, 14);
  
  const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0');
  const timeMid = ((timestamp >> 32) & 0xffff).toString(16).padStart(4, '0');
  const timeHigh = ((timestamp >> 48) & 0x0fff).toString(16).padStart(3, '0') + '1';
  
  return `${timeLow}-${timeMid}-${timeHigh}-${random.substring(0, 4)}-${random.substring(4)}`;
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
