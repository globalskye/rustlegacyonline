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

  async getServerInfo(): Promise<Types.ServerInfo> {
    return this.request<Types.ServerInfo>('/server-info');
  }

  async updateServerInfo(data: Partial<Types.ServerInfo>): Promise<Types.ServerInfo> {
    return this.request<Types.ServerInfo>('/server-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

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

  async getHowToStartSteps(lang?: string): Promise<Types.HowToStartStep[]> {
    const query = lang ? `?lang=${lang}` : '';
    return this.request<Types.HowToStartStep[]>(`/how-to-start${query}`);
  }

  async createHowToStartStep(data: Omit<Types.HowToStartStep, 'id'>): Promise<Types.HowToStartStep> {
    return this.request<Types.HowToStartStep>('/how-to-start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHowToStartStep(id: number, data: Partial<Types.HowToStartStep>): Promise<Types.HowToStartStep> {
    return this.request<Types.HowToStartStep>(`/how-to-start/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHowToStartStep(id: number): Promise<void> {
    return this.request<void>(`/how-to-start/${id}`, {
      method: 'DELETE',
    });
  }

  async getServerDetails(lang?: string, section?: string): Promise<Types.ServerDetail[]> {
    const params = new URLSearchParams();
    if (lang) params.append('lang', lang);
    if (section) params.append('section', section);
    
    const query = params.toString() ? `?${params.toString()}` : '';
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

  async deleteServerDetail(id: number): Promise<void> {
    return this.request<void>(`/server-details/${id}`, {
      method: 'DELETE',
    });
  }

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

  async deletePlugin(id: number): Promise<void> {
    return this.request<void>(`/plugins/${id}`, {
      method: 'DELETE',
    });
  }

  async createCommand(data: Omit<Types.Command, 'id'>): Promise<Types.Command> {
    return this.request<Types.Command>('/commands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCommand(id: number, data: Partial<Types.Command>): Promise<Types.Command> {
    return this.request<Types.Command>(`/commands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCommand(id: number): Promise<void> {
    return this.request<void>(`/commands/${id}`, {
      method: 'DELETE',
    });
  }

  async getRules(lang?: string): Promise<Types.Rule[]> {
    const query = lang ? `?lang=${lang}` : '';
    return this.request<Types.Rule[]>(`/rules${query}`);
  }

  async createRule(data: Omit<Types.Rule, 'id'>): Promise<Types.Rule> {
    return this.request<Types.Rule>('/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRule(id: number, data: Partial<Types.Rule>): Promise<Types.Rule> {
    return this.request<Types.Rule>(`/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRule(id: number): Promise<void> {
    return this.request<void>(`/rules/${id}`, {
      method: 'DELETE',
    });
  }

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

  async deleteLegalDocument(id: number): Promise<void> {
    return this.request<void>(`/legal-documents/${id}`, {
      method: 'DELETE',
    });
  }

  async getPlayers(onlineOnly: boolean = false): Promise<Types.Player[]> {
    const query = onlineOnly ? '?online=true' : '';
    return this.request<Types.Player[]>(`/players${query}`);
  }

  async getPlayer(steamId: string): Promise<Types.Player> {
    return this.request<Types.Player>(`/players/${steamId}`);
  }

  async getShopCategories(lang?: string): Promise<Types.ShopCategory[]> {
    const query = lang ? `?lang=${lang}` : '';
    return this.request<Types.ShopCategory[]>(`/shop/categories${query}`);
  }

  async createShopCategory(data: Omit<Types.ShopCategory, 'id'>): Promise<Types.ShopCategory> {
    return this.request<Types.ShopCategory>('/shop/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShopCategory(id: number, data: Partial<Types.ShopCategory>): Promise<Types.ShopCategory> {
    return this.request<Types.ShopCategory>(`/shop/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteShopCategory(id: number): Promise<void> {
    return this.request<void>(`/shop/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getShopItems(lang?: string, categoryId?: number): Promise<Types.ShopItem[]> {
    const params = new URLSearchParams();
    if (lang) params.append('lang', lang);
    if (categoryId) params.append('categoryId', categoryId.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Types.ShopItem[]>(`/shop/items${query}`);
  }

  async createShopItem(data: Omit<Types.ShopItem, 'id'>): Promise<Types.ShopItem> {
    return this.request<Types.ShopItem>('/shop/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShopItem(id: number, data: Partial<Types.ShopItem>): Promise<Types.ShopItem> {
    return this.request<Types.ShopItem>(`/shop/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteShopItem(id: number): Promise<void> {
    return this.request<void>(`/shop/items/${id}`, {
      method: 'DELETE',
    });
  }

  async getTheme(): Promise<Types.Theme> {
    return this.request<Types.Theme>('/theme');
  }

  async updateTheme(data: Partial<Types.Theme>): Promise<Types.Theme> {
    return this.request<Types.Theme>('/theme', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getFontSettings(): Promise<Types.FontSettings> {
    return this.request<Types.FontSettings>('/font-settings');
  }

  async updateFontSettings(data: Partial<Types.FontSettings>): Promise<Types.FontSettings> {
    return this.request<Types.FontSettings>('/font-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getServerStatus(serverType?: 'classic' | 'deathmatch'): Promise<Types.ServerStatus[]> {
    const query = serverType ? `?type=${serverType}` : '';
    return this.request<Types.ServerStatus[]>(`/server-status${query}`);
  }

  async getAllServers(): Promise<Types.ServerInfo[]> {
    return this.request<Types.ServerInfo[]>('/servers');
  }
}

export const apiService = new ApiService();
