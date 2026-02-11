import api, { getErrorMessage } from './api';
import { Invoice, InvoiceStatus, ApiResponse } from '../types';

export const invoiceService = {
  // Get my invoices
  async getMyInvoices(page: number = 1, limit: number = 20): Promise<{ invoices: Invoice[]; pagination: any }> {
    try {
      const response = await api.get('/invoices', { params: { page, limit } });
      return {
        invoices: response.data.data || [],
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get invoice details
  async getInvoiceDetails(invoiceId: string): Promise<Invoice> {
    try {
      const response = await api.get<ApiResponse<Invoice>>(`/invoices/${invoiceId}`);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get invoice by order ID
  async getInvoiceByOrderId(orderId: string): Promise<Invoice> {
    try {
      const response = await api.get<ApiResponse<Invoice>>(`/invoices/order/${orderId}`);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Download invoice PDF
  downloadInvoice(invoiceId: string): void {
    const token = localStorage.getItem('accessToken');
    const url = `${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/download`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    link.style.display = 'none';

    // Add authorization header via fetch and trigger download
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error('Download failed:', error);
        throw new Error('Failed to download invoice');
      });
  },

  // Get invoice PDF URL for viewing
  getInvoiceViewUrl(invoiceId: string): string {
    const token = localStorage.getItem('accessToken');
    return `${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/view?token=${token}`;
  },

  // Resend invoice email
  async resendInvoiceEmail(invoiceId: string): Promise<void> {
    try {
      await api.post(`/invoices/${invoiceId}/resend`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Admin: Get all invoices
  async getAllInvoices(
    page: number = 1,
    limit: number = 20,
    status?: InvoiceStatus
  ): Promise<{ invoices: Invoice[]; pagination: any }> {
    try {
      const params: any = { page, limit };
      if (status) params.status = status;

      const response = await api.get('/admin/invoices', { params });
      return {
        invoices: response.data.data || [],
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Admin: Download any invoice
  adminDownloadInvoice(invoiceId: string): void {
    const token = localStorage.getItem('accessToken');
    const url = `${import.meta.env.VITE_API_URL}/admin/invoices/${invoiceId}/download`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    link.style.display = 'none';

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error('Download failed:', error);
        throw new Error('Failed to download invoice');
      });
  },
};
