// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Scan and Vulnerability Types
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ScanResult {
  id: string;
  target: string;
  type: ScanType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  riskLevel: RiskLevel;
  findings: number;
  securityScore: number;
  createdAt: string;
  updatedAt: string;
  data?: any;
}

export interface ScanHistoryItem {
  id: string;
  target: string;
  timestamp: string;
  riskLevel: RiskLevel;
  findings: number;
  securityScore: number;
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: RiskLevel;
  description: string;
  remediation?: string;
  affected: string[];
}

// Tool Types
export interface ToolConfig {
  name: string;
  description: string;
  icon: string;
  endpoint: string;
  scanTypes?: string[];
  hasExtraFields?: boolean;
}

export type ScanType = 
  | 'port'
  | 'subdomain'
  | 'ssl'
  | 'waf'
  | 'sqli'
  | 'xss'
  | 'nuclei'
  | 'wordpress'
  | 'gobuster'
  | 'hydra'
  | 'header'
  | 'whois';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

// Component Prop Types
export interface ScanInputProps {
  onScan: (target: string, extraData?: Record<string, any>) => void;
  loading: boolean;
  placeholder?: string;
  showExtraFields?: boolean;
}

export interface ResultBoxProps {
  loading: boolean;
  result?: any;
  error?: string;
  riskLevel?: RiskLevel;
}

export interface ToolLayoutProps {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}

export interface ThemeColors {
  bg: string;
  bg2: string;
  bg3: string;
  primary: string;
  primaryHover: string;
  text: string;
  textSecondary: string;
  border: string;
  critical: string;
  high: string;
  medium: string;
  low: string;
  info: string;
}
