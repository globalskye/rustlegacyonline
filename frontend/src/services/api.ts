import * as Types from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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
  async getServerInfo(): Promise<Types.ServerInfo> {
    return this.request<Types.ServerInfo>('/server-info');
  }

  async updateServerInfo(data: Partial<Types.ServerInfo>): Promise<Types.ServerInfo> {
    return this.request<Types.ServerInfo>('/server-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Features
  async getFeatures(lang?: string): Promise<Types.Feature[]> {
    const query = lang ? `?lang=${lang}` : '';
    return this.request<Types.Feature[]>(`/features${query}`);
  }

  async createFeature(data: Omit<Types.Feature, 'id'>): Promise<Types.Feature> {
    return this.request<Types.Feature>('/features', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFeature(id: number, data: Partial<Types.Feature>): Promise<Types.Feature> {
    return this.request<Types.Feature>(`/features/${id}`, {
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
  async getNews(lang?: string, publishedOnly: boolean = true): Promise<Types.News[]> {
    const params = new URLSearchParams();
    if (lang) params.append('lang', lang);
    if (publishedOnly) params.append('published', 'true');
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Types.News[]>(`/news${query}`);
  }

  async getNewsItem(id: number): Promise<Types.News> {
    return this.request<Types.News>(`/news/${id}`);
  }

  async createNews(data: Omit<Types.News, 'id' | 'createdAt' | 'updatedAt'>): Promise<Types.News> {
    return this.request<Types.News>('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNews(id: number, data: Partial<Types.News>): Promise<Types.News> {
    return this.request<Types.News>(`/news/${id}`, {
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
  async getPlayers(onlineOnly: boolean = false): Promise<Types.Player[]> {
    const query = onlineOnly ? '?online=true' : '';
    return this.request<Types.Player[]>(`/players${query}`);
  }

  async getPlayer(steamId: string): Promise<Types.Player> {
    return this.request<Types.Player>(`/players/${steamId}`);
  }

  // Payment Methods
  async getPaymentMethods(): Promise<Types.PaymentMethod[]> {
    return this.request<Types.PaymentMethod[]>('/payment-methods');
  }

  async createPaymentMethod(data: Omit<Types.PaymentMethod, 'id'>): Promise<Types.PaymentMethod> {
    return this.request<Types.PaymentMethod>('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(id: number, data: Partial<Types.PaymentMethod>): Promise<Types.PaymentMethod> {
    return this.request<Types.PaymentMethod>(`/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentMethod(id: number): Promise<void> {
    return this.request<void>(`/payment-methods/${id}`, {
      method: 'DELETE',
    });
  }

  // Legal Documents
  async getLegalDocuments(lang?: string, type?: string): Promise<Types.LegalDocument[]> {
    const params = new URLSearchParams();
    if (lang) params.append('lang', lang);
    if (type) params.append('type', type);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Types.LegalDocument[]>(`/legal-documents${query}`);
  }

  async getLegalDocument(id: number): Promise<Types.LegalDocument> {
    return this.request<Types.LegalDocument>(`/legal-documents/${id}`);
  }

  async createLegalDocument(data: Omit<Types.LegalDocument, 'id'>): Promise<Types.LegalDocument> {
    return this.request<Types.LegalDocument>('/legal-documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLegalDocument(id: number, data: Partial<Types.LegalDocument>): Promise<Types.LegalDocument> {
    return this.request<Types.LegalDocument>(`/legal-documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Server Details
  async getServerDetails(lang?: string): Promise<Types.ServerDetail[]> {
    const query = lang ? `?lang=${lang}` : '';
    return this.request<Types.ServerDetail[]>(`/server-details${query}`);
  }

  async createServerDetail(data: Omit<Types.ServerDetail, 'id'>): Promise<Types.ServerDetail> {
    return this.request<Types.ServerDetail>('/server-details', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateServerDetail(id: number, data: Partial<Types.ServerDetail>): Promise<Types.ServerDetail> {
    return this.request<Types.ServerDetail>(`/server-details/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Plugins
  async getPlugins(lang?: string): Promise<Types.Plugin[]> {
    const query = lang ? `?lang=${lang}` : '';
    return this.request<Types.Plugin[]>(`/plugins${query}`);
  }

  async createPlugin(data: Omit<Types.Plugin, 'id'>): Promise<Types.Plugin> {
    return this.request<Types.Plugin>('/plugins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlugin(id: number, data: Partial<Types.Plugin>): Promise<Types.Plugin> {
    return this.request<Types.Plugin>(`/plugins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Getting Started Steps
  async getGettingStartedSteps(lang?: string): Promise<Types.GettingStartedStep[]> {
    const query = lang ? `?lang=${lang}` : '';
    return this.request<Types.GettingStartedStep[]>(`/getting-started${query}`);
  }

  async createGettingStartedStep(data: Omit<Types.GettingStartedStep, 'id'>): Promise<Types.GettingStartedStep> {
    return this.request<Types.GettingStartedStep>('/getting-started', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGettingStartedStep(id: number, data: Partial<Types.GettingStartedStep>): Promise<Types.GettingStartedStep> {
    return this.request<Types.GettingStartedStep>(`/getting-started/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
