import { CategoryModel } from '../models/Category';
import { AppError } from '../middleware/errorHandler';
import { CategoryCreateInput } from '../types';
import logger from '../utils/logger';

export class CategoryService {
  // Create category (admin only)
  static async create(data: CategoryCreateInput) {
    // Check if slug already exists
    const exists = await CategoryModel.slugExists(data.slug);
    if (exists) {
      throw new AppError('Category with this slug already exists', 409);
    }

    // Validate parent category if provided
    if (data.parent_id) {
      const parent = await CategoryModel.findById(data.parent_id);
      if (!parent) {
        throw new AppError('Parent category not found', 404);
      }
    }

    const category = await CategoryModel.create(data);
    logger.info(`Category created: ${category.id} - ${category.name}`);
    return category;
  }

  // Get all active categories (public)
  static async getAllActive() {
    return await CategoryModel.findAllActive();
  }

  // Get category tree (public)
  static async getCategoryTree() {
    return await CategoryModel.getCategoryTree();
  }

  // Get all categories (admin)
  static async getAll() {
    return await CategoryModel.findAll();
  }

  // Get category by ID
  static async getById(id: string) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  // Update category (admin only)
  static async update(id: string, data: Partial<CategoryCreateInput>) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check slug uniqueness if being updated
    if (data.slug && data.slug !== category.slug) {
      const exists = await CategoryModel.slugExists(data.slug, id);
      if (exists) {
        throw new AppError('Category with this slug already exists', 409);
      }
    }

    const updated = await CategoryModel.update(id, data);
    logger.info(`Category updated: ${id}`);
    return updated;
  }

  // Toggle active status (admin only)
  static async toggleActive(id: string) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const updated = await CategoryModel.toggleActive(id);
    logger.info(`Category active status toggled: ${id}`);
    return updated;
  }

  // Delete category (admin only)
  static async delete(id: string) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    await CategoryModel.delete(id);
    logger.info(`Category deleted: ${id}`);
  }
}
