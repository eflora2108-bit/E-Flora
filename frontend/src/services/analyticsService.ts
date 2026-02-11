import api, { getErrorMessage } from './api';

export const analyticsService = {
  // Get dashboard metrics
  async getDashboardMetrics(): Promise<any> {
    try {
      const response = await api.get('/admin/analytics/dashboard');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get revenue trend
  async getRevenueTrend(days: number = 30): Promise<any[]> {
    try {
      const response = await api.get('/admin/analytics/revenue-trend', { params: { days } });
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get sales report
  async getSalesReport(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/admin/analytics/sales-report', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get sales by category
  async getSalesByCategory(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/admin/analytics/sales-by-category', { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get sales by supplier
  async getSalesBySupplier(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/admin/analytics/sales-by-supplier', { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get inventory report
  async getInventoryReport(): Promise<any[]> {
    try {
      const response = await api.get('/admin/analytics/inventory-report');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Export report to CSV
  async exportReport(reportType: string, startDate?: string, endDate?: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      const params: any = { reportType };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/analytics/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportType}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
