// ============================================
// CARD MANAGEMENT SERVICE - Web Client
// ============================================

export interface CardSettings {
  contactlessEnabled: boolean;
  onlineTransactionsEnabled: boolean;
  internationalUsageEnabled: boolean;
}

export interface CardLimits {
  dailyLimit: number;
  monthlyLimit: number;
}

export interface CardReport {
  reportType: 'lost' | 'stolen' | 'damaged' | 'fraud' | 'other';
  description?: string;
}

export interface CardDetails {
  id: string;
  cardNumber: string;
  status: string;
  cardLocked: boolean;
  contactlessEnabled: boolean;
  onlineTransactionsEnabled: boolean;
  internationalUsageEnabled: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  currentDailySpend: number;
  currentMonthlySpend: number;
  hasPinSet: boolean;
  registeredAt: string;
  lastUsedAt: string | null;
}

class CardService {
  private baseUrl = '/api/cards';

  /**
   * Get card details
   */
  async getCardDetails(cardId: string): Promise<CardDetails> {
    const response = await fetch(`${this.baseUrl}/${cardId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch card details');
    }

    const data = await response.json();
    return data.card;
  }

  /**
   * Lock or unlock card
   */
  async toggleCardLock(cardId: string, locked: boolean): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${cardId}/lock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ locked }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update card lock status');
    }
  }

  /**
   * Change card PIN
   */
  async changePin(cardId: string, oldPin: string, newPin: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${cardId}/pin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ oldPin, newPin }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change PIN');
    }
  }

  /**
   * Update card settings (contactless, online, international)
   */
  async updateSettings(cardId: string, settings: Partial<CardSettings>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${cardId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update settings');
    }
  }

  /**
   * Update spending limits
   */
  async updateLimits(cardId: string, limits: Partial<CardLimits>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${cardId}/limits`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(limits),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update limits');
    }
  }

  /**
   * Report card issue
   */
  async reportIssue(cardId: string, report: CardReport): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${cardId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to report issue');
    }

    const data = await response.json();
    
    // Si la tarjeta fue bloqueada automáticamente, informar al usuario
    if (data.cardLocked) {
      console.log('⚠️ Card was automatically locked due to report type');
    }
  }

  /**
   * Get card reports
   */
  async getReports(cardId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/${cardId}/reports`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }

    const data = await response.json();
    return data.reports;
  }

  /**
   * Get card config history
   */
  async getHistory(cardId: string, limit: number = 50): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/${cardId}/history?limit=${limit}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    const data = await response.json();
    return data.history;
  }
}

export default new CardService();
