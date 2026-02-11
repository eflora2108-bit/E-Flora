import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export class CategoryController {
  // GET /api/v1/categories - Get all active categories (public)
  static getAllActive = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const categories = await CategoryService.getAllActive();

      res.json({
        success: true,
        data: categories,
      });
    }
  );

  // GET /api/v1/categories/tree - Get category tree (public)
  static getCategoryTree = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const tree = await CategoryService.getCategoryTree();

      res.json({
        success: true,
        data: tree,
      });
    }
  );

  // POST /api/v1/admin/categories - Create category (admin only)
  static create = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { name, slug, description, parent_id, image_url, display_order } = req.body;

      if (!name || !slug) {
        throw new AppError('Name and slug are required', 400);
      }

      const category = await CategoryService.create({
        name,
        slug,
        description,
        parent_id,
        image_url,
        display_order,
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    }
  );

  // GET /api/v1/admin/categories - Get all categories (admin only)
  static getAll = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const categories = await CategoryService.getAll();

      res.json({
        success: true,
        data: categories,
      });
    }
  );

  // PUT /api/v1/admin/categories/:id - Update category (admin only)
  static update = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updateData = req.body;

      const category = await CategoryService.update(id, updateData);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    }
  );

  // DELETE /api/v1/admin/categories/:id - Delete category (admin only)
  static delete = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      await CategoryService.delete(id);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    }
  );
}
