export interface ServerInfo {
  id: number;
  name: string;
  maxPlayers: number;
  gameVersion: string;
  downloadUrl: string;
  virusTotalUrl?: string;
  descriptions: Description[];
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

export interface Player {
  id: number;
  username: string;
  steamId: string;
  playTime: number;
  lastSeen: string;
  firstJoined: string;
  isOnline: boolean;
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

export interface ServerDetail {
  id: number;
  language: string;
  section: string;
  title: string;
  content: string;
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

export interface GettingStartedStep {
  id: number;
  language: string;
  stepNumber: number;
  title: string;
  content: string;
  imageUrl?: string;
}
