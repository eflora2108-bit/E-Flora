import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { Parser } from 'json2csv';

export class AnalyticsController {
  /**
   * Get dashboard metrics
   * GET /api/v1/admin/analytics/dashboard
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AnalyticsService.getDashboardMetrics();

      res.json({
        success: true,
        message: 'Dashboard metrics retrieved successfully',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get revenue trend
   * GET /api/v1/admin/analytics/revenue-trend
   */
  static async getRevenueTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const trend = await AnalyticsService.getRevenueTrend(days);

      res.json({
        success: true,
        message: 'Revenue trend retrieved successfully',
        data: trend,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales report
   * GET /api/v1/admin/analytics/sales-report
   */
  static async getSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const report = await AnalyticsService.getSalesReport(startDate, endDate);

      res.json({
        success: true,
        message: 'Sales report retrieved successfully',
        data: {
          ...report,
          dateRange: {
            startDate,
            endDate,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales by category
   * GET /api/v1/admin/analytics/sales-by-category
   */
  static async getSalesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const data = await AnalyticsService.getSalesByCategory(startDate, endDate);

      res.json({
        success: true,
        message: 'Sales by category retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales by supplier
   * GET /api/v1/admin/analytics/sales-by-supplier
   */
  static async getSalesBySupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const data = await AnalyticsService.getSalesBySupplier(startDate, endDate);

      res.json({
        success: true,
        message: 'Sales by supplier retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get inventory report
   * GET /api/v1/admin/analytics/inventory-report
   */
  static async getInventoryReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getInventoryReport();

      res.json({
        success: true,
        message: 'Inventory report retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export report to CSV
   * POST /api/v1/admin/analytics/export
   */
  static async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType, startDate, endDate } = req.body;

      let data: any[] = [];
      let filename = '';
      let fields: string[] = [];

      switch (reportType) {
        case 'sales':
          const salesData = await AnalyticsService.getSalesReport(
            startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)),
            endDate ? new Date(endDate) : new Date()
          );
          data = [salesData];
          filename = `sales-report-${Date.now()}.csv`;
          fields = ['totalOrders', 'totalRevenue', 'totalSubtotal', 'totalGst', 'totalShipping', 'averageOrderValue'];
          break;

        case 'category':
          data = await AnalyticsService.getSalesByCategory(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
          );
          filename = `sales-by-category-${Date.now()}.csv`;
          fields = ['categoryName', 'orderCount', 'totalQuantity', 'totalRevenue'];
          break;

        case 'supplier':
          data = await AnalyticsService.getSalesBySupplier(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
          );
          filename = `sales-by-supplier-${Date.now()}.csv`;
          fields = ['businessName', 'email', 'orderCount', 'totalQuantity', 'totalRevenue'];
          break;

        case 'inventory':
          data = await AnalyticsService.getInventoryReport();
          filename = `inventory-report-${Date.now()}.csv`;
          fields = ['productName', 'sku', 'stockQuantity', 'lowStockThreshold', 'categoryName', 'supplierName', 'stockStatus'];
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type',
          });
      }

      // Convert to CSV
      const parser = new Parser({ fields });
      const csv = parser.parse(data);

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    } catch (error) {
      return next(error);
    }
  }
}
