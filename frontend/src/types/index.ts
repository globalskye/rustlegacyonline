export interface ServerInfo {
  id: number;
  name: string;
  maxPlayers: number;
  gameVersion: string;
  downloadUrl: string;
  virusTotalUrl?: string;
  descriptions: Description[];
  type?: 'classic' | 'deathmatch';
  ip?: string;
  port?: number;
}

export interface Description {
  id: number;
  serverInfoId: number;
  language: string;
  content: string;
}

export interface Feature {
  id: number;
  serverInfoId: number;
  language: string;
  title: string;
  description?: string;
  icon: string;
  order: number;
}

export interface News {
  id: number;
  language: string;
  title: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface HowToStartStep {
  id: number;
  language: string;
  stepNumber: number;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface ServerDetail {
  id: number;
  language: string;
  section: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  order: number;
}

export interface Plugin {
  id: number;
  language: string;
  name: string;
  description: string;
  commands: Command[];
  order: number;
}

export interface Command {
  id: number;
  pluginId: number;
  command: string;
  description: string;
  usage?: string;
}

export interface Rule {
  id: number;
  language: string;
  title: string;
  content: string;
  order: number;
}

export interface Player {
  id: number;
  username: string;
  steamId: string;
  playTime: number;
  lastSeen: string;
  firstJoined: string;
  isOnline: boolean;
  kills?: number;
  deaths?: number;
  rank?: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
  imageUrl: string;
  order: number;
  enabled: boolean;
}

export interface LegalDocument {
  id: number;
  language: string;
  type: 'terms' | 'privacy' | 'rules' | 'company_info';
  title: string;
  content: string;
  updatedAt: string;
}

export interface ShopCategory {
  id: number;
  name: string;
  language: string;
  order: number;
  enabled: boolean;
}

export interface ShopItem {
  id: number;
  categoryId: number;
  language: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  enabled: boolean;
  order: number;
  features?: string[];
  discount?: number;
}

export interface Theme {
  id: number;
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  glowColor: string;
  isActive: boolean;
}

export interface FontSettings {
  id: number;
  headingFont: string;
  bodyFont: string;
  h1Size: string;
  h2Size: string;
  h3Size: string;
  bodySize: string;
}

export interface ServerStatus {
  serverId: number;
  serverName: string;
  serverType: 'classic' | 'deathmatch';
  isOnline: boolean;
  currentPlayers: number;
  maxPlayers: number;
  map: string;
  uptime: number;
  ip: string;
  port: number;
  activePlayers: Player[];
}
