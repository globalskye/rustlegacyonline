const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface ServerInfo {
  id: number;
  name: string;
  maxPlayers: number;
  gameVersion: string;
  downloadUrl: string;
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

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Server Info
  async getServerInfo(): Promise<ServerInfo> {
    return this.request<ServerInfo>('/server-info');
  }

  async updateServerInfo(data: Partial<ServerInfo>): Promise<ServerInfo> {
    return this.request<ServerInfo>('/server-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Features
  async getFeatures(lang?: string): Promise<Feature[]> {
    const query = lang ? `?lang=${lang}` : '';
    return this.request<Feature[]>(`/features${query}`);
  }

  async createFeature(data: Omit<Feature, 'id'>): Promise<Feature> {
    return this.request<Feature>('/features', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFeature(id: number, data: Partial<Feature>): Promise<Feature> {
    return this.request<Feature>(`/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFeature(id: number): Promise<void> {
    return this.request<void>(`/features/${id}`, {
      method: 'DELETE',
    });
  }

  // News
  async getNews(lang?: string, publishedOnly: boolean = true): Promise<News[]> {
    const params = new URLSearchParams();
    if (lang) params.append('lang', lang);
    if (publishedOnly) params.append('published', 'true');
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<News[]>(`/news${query}`);
  }

  async getNewsItem(id: number): Promise<News> {
    return this.request<News>(`/news/${id}`);
  }

  async createNews(data: Omit<News, 'id' | 'createdAt' | 'updatedAt'>): Promise<News> {
    return this.request<News>('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNews(id: number, data: Partial<News>): Promise<News> {
    return this.request<News>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNews(id: number): Promise<void> {
    return this.request<void>(`/news/${id}`, {
      method: 'DELETE',
    });
  }

  // Players
  async getPlayers(onlineOnly: boolean = false): Promise<Player[]> {
    const query = onlineOnly ? '?online=true' : '';
    return this.request<Player[]>(`/players${query}`);
  }

  async getPlayer(steamId: string): Promise<Player> {
    return this.request<Player>(`/players/${steamId}`);
  }
}

export const apiService = new ApiService();
