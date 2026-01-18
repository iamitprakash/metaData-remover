import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconWorld, IconCopy } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

export const IPAddressTools = () => {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const isValidIP = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const parseIPv4 = (ip: string) => {
    const parts = ip.split('.').map(Number);
    return {
      octet1: parts[0],
      octet2: parts[1],
      octet3: parts[2],
      octet4: parts[3],
      binary: parts.map(p => p.toString(2).padStart(8, '0')).join('.'),
      hex: parts.map(p => p.toString(16).padStart(2, '0').toUpperCase()).join('.'),
    };
  };

  const calculateSubnet = (ip: string, mask: number) => {
    const parts = ip.split('.').map(Number);
    const maskParts: number[] = [];
    let remaining = mask;
    for (let i = 0; i < 4; i++) {
      if (remaining >= 8) {
        maskParts.push(255);
        remaining -= 8;
      } else {
        maskParts.push(256 - Math.pow(2, 8 - remaining));
        remaining = 0;
      }
    }
    const network = parts.map((p, i) => p & maskParts[i]);
    const broadcast = parts.map((p, i) => p | (255 - maskParts[i]));
    const hostCount = Math.pow(2, 32 - mask) - 2;
    return {
      network: network.join('.'),
      broadcast: broadcast.join('.'),
      subnetMask: maskParts.join('.'),
      hostCount,
      firstHost: network.map((p, i) => i === 3 ? p + 1 : p).join('.'),
      lastHost: broadcast.map((p, i) => i === 3 ? p - 1 : p).join('.'),
    };
  };

  const handleLookup = async () => {
    if (!ip.trim()) {
      showToast('Please enter an IP address', 'error');
      return;
    }

    if (!isValidIP(ip)) {
      showToast('Invalid IP address format', 'error');
      return;
    }

    setLoading(true);
    try {
      // Client-side IP parsing
      const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
      const parsed = isIPv4 ? parseIPv4(ip) : null;
      
      // Try to get geolocation (using a free API)
      let geoData = null;
      try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (response.ok) {
          geoData = await response.json();
        }
      } catch (err) {
        // Silently fail - geolocation is optional
      }

      setResult({
        ip,
        type: isIPv4 ? 'IPv4' : 'IPv6',
        parsed,
        geo: geoData,
      });
      showToast('IP address analyzed');
    } catch (err) {
      showToast('Failed to analyze IP address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubnetCalc = () => {
    if (!ip.trim()) {
      showToast('Please enter an IP address', 'error');
      return;
    }

    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
    if (!isIPv4) {
      showToast('Subnet calculator only supports IPv4', 'error');
      return;
    }

    const mask = 24; // Default /24
    const subnet = calculateSubnet(ip, mask);
    setResult({
      ip,
      subnet,
      mask,
    });
    showToast('Subnet calculated');
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
            <IconWorld className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            IP Address Tools
          </h1>
          <p className="text-muted-foreground">IP lookup, subnet calculator, and IP range checker</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">IP Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.1 or 2001:0db8::1"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
              <button
                onClick={handleLookup}
                disabled={loading || !ip.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Lookup
              </button>
              <button
                onClick={handleSubnetCalc}
                disabled={!ip.trim()}
                className="px-6 py-2 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Subnet Calc
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">IP Information</h3>
                  <button
                    onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">IP Address:</span>
                    <span className="ml-2 font-mono">{result.ip}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-mono">{result.type}</span>
                  </div>
                  
                  {result.parsed && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Binary:</span>
                        <span className="ml-2 font-mono">{result.parsed.binary}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hexadecimal:</span>
                        <span className="ml-2 font-mono">{result.parsed.hex}</span>
                      </div>
                    </>
                  )}

                  {result.geo && (
                    <>
                      {result.geo.city && (
                        <div>
                          <span className="text-muted-foreground">City:</span>
                          <span className="ml-2">{result.geo.city}</span>
                        </div>
                      )}
                      {result.geo.region && (
                        <div>
                          <span className="text-muted-foreground">Region:</span>
                          <span className="ml-2">{result.geo.region}</span>
                        </div>
                      )}
                      {result.geo.country_name && (
                        <div>
                          <span className="text-muted-foreground">Country:</span>
                          <span className="ml-2">{result.geo.country_name}</span>
                        </div>
                      )}
                      {result.geo.org && (
                        <div>
                          <span className="text-muted-foreground">ISP:</span>
                          <span className="ml-2">{result.geo.org}</span>
                        </div>
                      )}
                    </>
                  )}

                  {result.subnet && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Network:</span>
                        <span className="ml-2 font-mono">{result.subnet.network}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Broadcast:</span>
                        <span className="ml-2 font-mono">{result.subnet.broadcast}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Subnet Mask:</span>
                        <span className="ml-2 font-mono">{result.subnet.subnetMask}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Host Count:</span>
                        <span className="ml-2 font-mono">{result.subnet.hostCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">First Host:</span>
                        <span className="ml-2 font-mono">{result.subnet.firstHost}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Host:</span>
                        <span className="ml-2 font-mono">{result.subnet.lastHost}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
