import type { ToolConfig, ThemeColors, RiskLevel } from '@types/index';

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.vulnforge.app',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '300000'),
  endpoints: {
    targets: '/api/targets/',
    history: '/api/history/',
    fullscan: '/api/fullscan/ws/',
    portscan: '/api/portscan/',
    subdomain: '/api/subdomain/',
    ssl: '/api/ssl/',
    waf: '/api/waf/',
    sqli: '/api/sqli/',
    xss: '/api/xss/',
    nuclei: '/api/nuclei/',
    wordpress: '/api/wpscan/',
    gobuster: '/api/gobuster/',
    hydra: '/api/hydra/',
    header: '/api/headers/',
    whois: '/api/whois/',
  }
};

export const SECURITY_TOOLS: Record<string, ToolConfig> = {
  port_scanner: {
    name: 'Port Scanner',
    description: 'Comprehensive port scanning with Nmap',
    icon: '🔍',
    endpoint: API_CONFIG.endpoints.portscan,
    scanTypes: ['basic', 'full', 'service', 'udp'],
    hasExtraFields: true,
  },
  subdomain_finder: {
    name: 'Subdomain Finder',
    description: 'Enumerates subdomains using Subfinder',
    icon: '🌐',
    endpoint: API_CONFIG.endpoints.subdomain,
  },
  header_scanner: {
    name: 'Header Scanner',
    description: 'Analyzes security headers',
    icon: '🔎',
    endpoint: API_CONFIG.endpoints.header,
  },
  ssl_scanner: {
    name: 'SSL Certificate Scanner',
    description: 'Analyzes SSL/TLS configurations',
    icon: '🔒',
    endpoint: API_CONFIG.endpoints.ssl,
  },
  waf_detector: {
    name: 'WAF Detector',
    description: 'Detects Web Application Firewalls',
    icon: '🛡️',
    endpoint: API_CONFIG.endpoints.waf,
  },
  sqli_scanner: {
    name: 'SQL Injection Scanner',
    description: 'Tests for SQL injection vulnerabilities',
    icon: '💉',
    endpoint: API_CONFIG.endpoints.sqli,
  },
  xss_scanner: {
    name: 'XSS Scanner',
    description: 'Identifies XSS vulnerabilities',
    icon: '⚡',
    endpoint: API_CONFIG.endpoints.xss,
  },
  cve_scanner: {
    name: 'CVE Scanner',
    description: 'Scans with 9000+ Nuclei templates',
    icon: '☢️',
    endpoint: API_CONFIG.endpoints.nuclei,
    scanTypes: ['critical', 'high', 'medium', 'all'],
    hasExtraFields: true,
  },
  wordpress_scanner: {
    name: 'WordPress Scanner',
    description: 'Specialized WordPress vulnerability detection',
    icon: '📰',
    endpoint: API_CONFIG.endpoints.wordpress,
  },
  url_fuzzer: {
    name: 'URL Fuzzer',
    description: 'Directory brute-force with Gobuster',
    icon: '📁',
    endpoint: API_CONFIG.endpoints.gobuster,
    scanTypes: ['common', 'big'],
    hasExtraFields: true,
  },
  password_auditor: {
    name: 'Password Auditor',
    description: 'Brute-force testing with Hydra',
    icon: '🔑',
    endpoint: API_CONFIG.endpoints.hydra,
    hasExtraFields: true,
  },
  whois_lookup: {
    name: 'WHOIS Lookup',
    description: 'Domain registration information',
    icon: '📋',
    endpoint: API_CONFIG.endpoints.whois,
  },
};

export const THEME_COLORS: ThemeColors = {
  bg: '#020408',
  bg2: '#060d12',
  bg3: '#0a1520',
  primary: '#00ff88',
  primaryHover: '#00cc66',
  text: '#e0f0e0',
  textSecondary: '#7a9a8a',
  border: '#0a2a1a',
  critical: '#ff3355',
  high: '#ff6633',
  medium: '#ffcc00',
  low: '#00ff88',
  info: '#00aaff',
};

export const RISK_LEVELS: Record<RiskLevel, string> = {
  CRITICAL: THEME_COLORS.critical,
  HIGH: THEME_COLORS.high,
  MEDIUM: THEME_COLORS.medium,
  LOW: THEME_COLORS.low,
  INFO: THEME_COLORS.info,
};

export const AUTH_CONFIG = {
  storageKey: 'vulnforge_user',
  headerKey: 'X-User-Email',
  redirectTo: {
    login: '/login',
    dashboard: '/dashboard',
  }
};

export const WS_CONFIG = {
  reconnectAttempts: 3,
  reconnectDelay: 3000,
  heartbeatInterval: 30000,
};

export const SCAN_PHASES = [
  'RECON',
  'AI ANALYSIS',
  'AI ATTACKS',
  'REPORT',
];

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  DASHBOARD: '/dashboard',
  TARGETS: '/targets',
  SCANS: '/scans',
  SCAN_REPORT: '/scans/:id',
  TOOLS: {
    PORT_SCANNER: '/tools/port-scanner',
    SUBDOMAIN_FINDER: '/tools/subdomain-finder',
    HEADER_SCANNER: '/tools/header-scanner',
    SSL_SCANNER: '/tools/ssl-scanner',
    WAF_DETECTOR: '/tools/waf-detector',
    SQLI_SCANNER: '/tools/sqli-scanner',
    XSS_SCANNER: '/tools/xss-scanner',
    CVE_SCANNER: '/tools/cve-scanner',
    WORDPRESS_SCANNER: '/tools/wordpress-scanner',
    URL_FUZZER: '/tools/url-fuzzer',
    PASSWORD_AUDITOR: '/tools/password-auditor',
    WHOIS_LOOKUP: '/tools/whois-lookup',
  }
};

export const ANIMATIONS = {
  duration: {
    fast: 0.2,
    normal: 0.5,
    slow: 1,
  },
  delay: {
    small: 0.1,
    medium: 0.3,
    large: 0.5,
  }
};

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  target: /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: true,
  }
};

export const PASSWORD_STRENGTH_LEVELS = {
  0: { label: 'Very Weak', color: THEME_COLORS.critical },
  1: { label: 'Weak', color: THEME_COLORS.high },
  2: { label: 'Fair', color: THEME_COLORS.medium },
  3: { label: 'Strong', color: '#33ff00' },
  4: { label: 'Very Strong', color: THEME_COLORS.low },
};
