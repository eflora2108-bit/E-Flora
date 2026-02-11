import { GSTCalculation, OrderItem } from '../types';

/**
 * Calculate GST breakdown for an order
 * - Intra-state (same state): CGST + SGST (split 50-50)
 * - Inter-state (different states): IGST (full amount)
 */
export class GSTCalculator {
  /**
   * Calculate GST for order items
   * @param items - Order items with GST information
   * @param buyerState - Buyer's state
   * @param sellerState - Seller's state (can be multiple if different suppliers)
   * @returns GST breakdown
   */
  static calculateOrderGST(
    items: OrderItem[],
    buyerState: string,
    sellerState: string
  ): GSTCalculation {
    // Calculate total GST from all items
    const totalGst = items.reduce((sum, item) => sum + item.gst_amount, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    // Determine if inter-state or intra-state
    const isInterState = buyerState.toLowerCase() !== sellerState.toLowerCase();

    if (isInterState) {
      // Inter-state: IGST only
      return {
        subtotal,
        cgst: 0,
        sgst: 0,
        igst: totalGst,
        totalGst,
        isInterState: true,
      };
    } else {
      // Intra-state: CGST + SGST (split equally)
      const halfGst = totalGst / 2;
      return {
        subtotal,
        cgst: halfGst,
        sgst: halfGst,
        igst: 0,
        totalGst,
        isInterState: false,
      };
    }
  }

  /**
   * Calculate GST amount from price and percentage
   * @param price - Base price
   * @param gstPercentage - GST percentage (e.g., 18 for 18%)
   * @returns GST amount
   */
  static calculateGSTAmount(price: number, gstPercentage: number): number {
    return (price * gstPercentage) / 100;
  }

  /**
   * Calculate price including GST
   * @param price - Base price (excluding GST)
   * @param gstPercentage - GST percentage
   * @returns Price including GST
   */
  static calculatePriceWithGST(price: number, gstPercentage: number): number {
    return price + this.calculateGSTAmount(price, gstPercentage);
  }

  /**
   * Extract base price from price including GST
   * @param priceWithGst - Price including GST
   * @param gstPercentage - GST percentage
   * @returns Base price (excluding GST)
   */
  static extractBasePrice(priceWithGst: number, gstPercentage: number): number {
    return priceWithGst / (1 + gstPercentage / 100);
  }

  /**
   * Format GST number (GSTIN)
   * @param gstin - GST Identification Number
   * @returns Formatted GSTIN
   */
  static formatGSTIN(gstin: string): string {
    // Remove all non-alphanumeric characters
    const cleaned = gstin.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // GSTIN format: 22AAAAA0000A1Z5 (15 characters)
    if (cleaned.length === 15) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7, 11)} ${cleaned.slice(11, 12)} ${cleaned.slice(12, 14)} ${cleaned.slice(14, 15)}`;
    }

    return cleaned;
  }

  /**
   * Validate GSTIN format
   * @param gstin - GST Identification Number
   * @returns True if valid format
   */
  static validateGSTIN(gstin: string): boolean {
    // GSTIN format: 22AAAAA0000A1Z5
    // 2 digits (state code) + 10 alphanumeric (PAN) + 1 digit + 1 letter + 1 alphanumeric
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin.replace(/\s/g, '').toUpperCase());
  }

  /**
   * Get state code from GSTIN
   * @param gstin - GST Identification Number
   * @returns State code (first 2 digits)
   */
  static getStateCodeFromGSTIN(gstin: string): string {
    const cleaned = gstin.replace(/\s/g, '');
    return cleaned.slice(0, 2);
  }

  /**
   * Round to 2 decimal places (for currency)
   * @param value - Value to round
   * @returns Rounded value
   */
  static roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
