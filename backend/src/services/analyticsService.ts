import { query } from '../config/database';
import { OrderStatus, PaymentStatus, SupplierVerificationStatus, ProductModerationStatus } from '../types';

export class AnalyticsService {
  /**
   * Get dashboard overview metrics
   */
  static async getDashboardMetrics(): Promise<any> {
    const [
      revenueMetrics,
      orderMetrics,
      userMetrics,
      productMetrics,
      topProducts,
      recentOrders,
      pendingActions,
    ] = await Promise.all([
      this.getRevenueMetrics(),
      this.getOrderMetrics(),
      this.getUserMetrics(),
      this.getProductMetrics(),
      this.getTopSellingProducts(10),
      this.getRecentOrders(10),
      this.getPendingActions(),
    ]);

    return {
      revenue: revenueMetrics,
      orders: orderMetrics,
      users: userMetrics,
      products: productMetrics,
      topProducts,
      recentOrders,
      pendingActions,
    };
  }

  /**
   * Get revenue metrics
   */
  static async getRevenueMetrics(): Promise<any> {
    // Total revenue (all time)
    const totalSql = `
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
      WHERE payment_status = $1
    `;
    const totalResult = await query(totalSql, [PaymentStatus.COMPLETED]);
    const totalRevenue = parseFloat(totalResult.rows[0].total_revenue);

    // Today's revenue
    const todaySql = `
      SELECT COALESCE(SUM(total_amount), 0) as today_revenue
      FROM orders
      WHERE payment_status = $1
        AND DATE(created_at) = CURRENT_DATE
    `;
    const todayResult = await query(todaySql, [PaymentStatus.COMPLETED]);
    const todayRevenue = parseFloat(todayResult.rows[0].today_revenue);

    // This month's revenue
    const monthSql = `
      SELECT COALESCE(SUM(total_amount), 0) as month_revenue
      FROM orders
      WHERE payment_status = $1
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `;
    const monthResult = await query(monthSql, [PaymentStatus.COMPLETED]);
    const monthRevenue = parseFloat(monthResult.rows[0].month_revenue);

    // Last month's revenue (for comparison)
    const lastMonthSql = `
      SELECT COALESCE(SUM(total_amount), 0) as last_month_revenue
      FROM orders
      WHERE payment_status = $1
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    `;
    const lastMonthResult = await query(lastMonthSql, [PaymentStatus.COMPLETED]);
    const lastMonthRevenue = parseFloat(lastMonthResult.rows[0].last_month_revenue);

    // Calculate growth percentage
    const growthPercentage =
      lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    return {
      total: totalRevenue,
      today: todayRevenue,
      thisMonth: monthRevenue,
      lastMonth: lastMonthRevenue,
      growthPercentage: Math.round(growthPercentage * 100) / 100,
    };
  }

  /**
   * Get order metrics
   */
  static async getOrderMetrics(): Promise<any> {
    // Total orders
    const totalSql = 'SELECT COUNT(*) as total FROM orders';
    const totalResult = await query(totalSql);
    const total = parseInt(totalResult.rows[0].total);

    // Orders by status
    const statusSql = `
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `;
    const statusResult = await query(statusSql);
    const byStatus = statusResult.rows.reduce((acc: any, row: any) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});

    // Today's orders
    const todaySql = `
      SELECT COUNT(*) as count
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    const todayResult = await query(todaySql);
    const today = parseInt(todayResult.rows[0].count);

    // This month's orders
    const monthSql = `
      SELECT COUNT(*) as count
      FROM orders
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `;
    const monthResult = await query(monthSql);
    const thisMonth = parseInt(monthResult.rows[0].count);

    return {
      total,
      byStatus,
      today,
      thisMonth,
    };
  }

  /**
   * Get user metrics
   */
  static async getUserMetrics(): Promise<any> {
    // Total users by role
    const roleSql = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;
    const roleResult = await query(roleSql);
    const byRole = roleResult.rows.reduce((acc: any, row: any) => {
      acc[row.role] = parseInt(row.count);
      return acc;
    }, {});

    // New users this month
    const newUsersSql = `
      SELECT COUNT(*) as count
      FROM users
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `;
    const newUsersResult = await query(newUsersSql);
    const newThisMonth = parseInt(newUsersResult.rows[0].count);

    // Active users (users who have placed orders)
    const activeSql = `
      SELECT COUNT(DISTINCT user_id) as count
      FROM orders
    `;
    const activeResult = await query(activeSql);
    const activeUsers = parseInt(activeResult.rows[0].count);

    return {
      byRole,
      newThisMonth,
      activeUsers,
      total: Object.values(byRole).reduce((sum: number, count: any) => sum + count, 0),
    };
  }

  /**
   * Get product metrics
   */
  static async getProductMetrics(): Promise<any> {
    // Total products
    const totalSql = 'SELECT COUNT(*) as total FROM products';
    const totalResult = await query(totalSql);
    const total = parseInt(totalResult.rows[0].total);

    // Products by status
    const statusSql = `
      SELECT moderation_status, COUNT(*) as count
      FROM products
      GROUP BY moderation_status
    `;
    const statusResult = await query(statusSql);
    const byStatus = statusResult.rows.reduce((acc: any, row: any) => {
      acc[row.moderation_status] = parseInt(row.count);
      return acc;
    }, {});

    // Low stock products
    const lowStockSql = `
      SELECT COUNT(*) as count
      FROM products
      WHERE stock_quantity <= low_stock_threshold
        AND moderation_status = $1
        AND is_active = true
    `;
    const lowStockResult = await query(lowStockSql, [ProductModerationStatus.APPROVED]);
    const lowStock = parseInt(lowStockResult.rows[0].count);

    // Out of stock
    const outOfStockSql = `
      SELECT COUNT(*) as count
      FROM products
      WHERE stock_quantity = 0
        AND moderation_status = $1
        AND is_active = true
    `;
    const outOfStockResult = await query(outOfStockSql, [ProductModerationStatus.APPROVED]);
    const outOfStock = parseInt(outOfStockResult.rows[0].count);

    return {
      total,
      byStatus,
      lowStock,
      outOfStock,
    };
  }

  /**
   * Get top selling products
   */
  static async getTopSellingProducts(limit: number = 10): Promise<any[]> {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.sku,
        p.price,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM products p
      INNER JOIN order_items oi ON p.id = oi.product_id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = $1
      GROUP BY p.id, p.name, p.sku, p.price
      ORDER BY total_quantity DESC
      LIMIT $2
    `;

    const result = await query(sql, [PaymentStatus.COMPLETED, limit]);
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      price: parseFloat(row.price),
      totalQuantity: parseInt(row.total_quantity),
      totalRevenue: parseFloat(row.total_revenue),
      orderCount: parseInt(row.order_count),
    }));
  }

  /**
   * Get recent orders
   */
  static async getRecentOrders(limit: number = 10): Promise<any[]> {
    const sql = `
      SELECT
        o.*,
        u.first_name,
        u.last_name,
        u.email
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * Get pending actions (suppliers, products)
   */
  static async getPendingActions(): Promise<any> {
    // Pending supplier verifications
    const pendingSuppliersSql = `
      SELECT COUNT(*) as count
      FROM suppliers
      WHERE verification_status = $1
    `;
    const pendingSuppliersResult = await query(pendingSuppliersSql, [
      SupplierVerificationStatus.PENDING,
    ]);
    const pendingSuppliers = parseInt(pendingSuppliersResult.rows[0].count);

    // Pending product moderations
    const pendingProductsSql = `
      SELECT COUNT(*) as count
      FROM products
      WHERE moderation_status = $1
    `;
    const pendingProductsResult = await query(pendingProductsSql, [
      ProductModerationStatus.PENDING,
    ]);
    const pendingProducts = parseInt(pendingProductsResult.rows[0].count);

    return {
      pendingSuppliers,
      pendingProducts,
      total: pendingSuppliers + pendingProducts,
    };
  }

  /**
   * Get revenue trend (last N days)
   */
  static async getRevenueTrend(days: number = 30): Promise<any[]> {
    const sql = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE payment_status = $1
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await query(sql, [PaymentStatus.COMPLETED]);
    return result.rows.map((row: any) => ({
      date: row.date,
      orderCount: parseInt(row.order_count),
      revenue: parseFloat(row.revenue),
    }));
  }

  /**
   * Get sales report by date range
   */
  static async getSalesReport(startDate: Date, endDate: Date): Promise<any> {
    const sql = `
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(subtotal), 0) as total_subtotal,
        COALESCE(SUM(gst_amount), 0) as total_gst,
        COALESCE(SUM(shipping_charges), 0) as total_shipping,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders
      WHERE payment_status = $1
        AND created_at BETWEEN $2 AND $3
    `;

    const result = await query(sql, [PaymentStatus.COMPLETED, startDate, endDate]);
    const row = result.rows[0];

    return {
      totalOrders: parseInt(row.total_orders),
      totalRevenue: parseFloat(row.total_revenue),
      totalSubtotal: parseFloat(row.total_subtotal),
      totalGst: parseFloat(row.total_gst),
      totalShipping: parseFloat(row.total_shipping),
      averageOrderValue: parseFloat(row.average_order_value),
    };
  }

  /**
   * Get sales by category
   */
  static async getSalesByCategory(startDate?: Date, endDate?: Date): Promise<any[]> {
    let sql = `
      SELECT
        c.id,
        c.name as category_name,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.quantity) as total_quantity,
        COALESCE(SUM(oi.total_amount), 0) as total_revenue
      FROM categories c
      INNER JOIN products p ON c.id = p.category_id
      INNER JOIN order_items oi ON p.id = oi.product_id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = $1
    `;

    const params: any[] = [PaymentStatus.COMPLETED];

    if (startDate && endDate) {
      sql += ' AND o.created_at BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    sql += `
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
    `;

    const result = await query(sql, params);
    return result.rows.map((row: any) => ({
      categoryId: row.id,
      categoryName: row.category_name,
      orderCount: parseInt(row.order_count),
      totalQuantity: parseInt(row.total_quantity),
      totalRevenue: parseFloat(row.total_revenue),
    }));
  }

  /**
   * Get sales by supplier
   */
  static async getSalesBySupplier(startDate?: Date, endDate?: Date): Promise<any[]> {
    let sql = `
      SELECT
        s.id,
        s.business_name,
        u.email,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.quantity) as total_quantity,
        COALESCE(SUM(oi.total_amount), 0) as total_revenue
      FROM suppliers s
      INNER JOIN users u ON s.user_id = u.id
      INNER JOIN order_items oi ON s.id = oi.supplier_id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = $1
    `;

    const params: any[] = [PaymentStatus.COMPLETED];

    if (startDate && endDate) {
      sql += ' AND o.created_at BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    sql += `
      GROUP BY s.id, s.business_name, u.email
      ORDER BY total_revenue DESC
    `;

    const result = await query(sql, params);
    return result.rows.map((row: any) => ({
      supplierId: row.id,
      businessName: row.business_name,
      email: row.email,
      orderCount: parseInt(row.order_count),
      totalQuantity: parseInt(row.total_quantity),
      totalRevenue: parseFloat(row.total_revenue),
    }));
  }

  /**
   * Get inventory report
   */
  static async getInventoryReport(): Promise<any[]> {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.sku,
        p.stock_quantity,
        p.low_stock_threshold,
        c.name as category_name,
        s.business_name as supplier_name,
        CASE
          WHEN p.stock_quantity = 0 THEN 'out_of_stock'
          WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.moderation_status = $1 AND p.is_active = true
      ORDER BY p.stock_quantity ASC
    `;

    const result = await query(sql, [ProductModerationStatus.APPROVED]);
    return result.rows.map((row: any) => ({
      productId: row.id,
      productName: row.name,
      sku: row.sku,
      stockQuantity: parseInt(row.stock_quantity),
      lowStockThreshold: parseInt(row.low_stock_threshold),
      categoryName: row.category_name,
      supplierName: row.supplier_name,
      stockStatus: row.stock_status,
    }));
  }
}
