import multer from 'multer';
import path from 'path';
import fs from 'fs';
import env from './env';
import { AppError } from '../middleware/errorHandler';

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_PATH);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subFolder = file.fieldname === 'documents' ? 'documents' : 'products';
    const dir = path.join(uploadDir, subFolder);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9_-]/g, '_');

    cb(null, `${sanitizedBasename}-${uniqueSuffix}${ext}`);
  },
});

// File filter for documents
const documentFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = env.ALLOWED_DOC_TYPES.split(',');
  const isAllowed = allowedTypes.includes(file.mimetype);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new AppError(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      400
    ));
  }
};

// File filter for images
const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = env.ALLOWED_IMAGE_TYPES.split(',');
  const isAllowed = allowedTypes.includes(file.mimetype);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new AppError(
      `Invalid image type. Allowed types: ${allowedTypes.join(', ')}`,
      400
    ));
  }
};

// Document upload (for supplier verification)
export const uploadDocuments = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // 10MB by default
    files: 5, // Maximum 5 files
  },
});

// Product image upload
export const uploadProductImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: 10, // Maximum 10 images
  },
});

// Single file upload utility
export const uploadSingle = (fieldName: string, fileType: 'image' | 'document' = 'document') => {
  const uploader = fileType === 'image' ? uploadProductImages : uploadDocuments;
  return uploader.single(fieldName);
};

// Multiple files upload utility
export const uploadMultiple = (fieldName: string, maxCount: number = 5, fileType: 'image' | 'document' = 'document') => {
  const uploader = fileType === 'image' ? uploadProductImages : uploadDocuments;
  return uploader.array(fieldName, maxCount);
};

// Get file URL
export const getFileUrl = (filename: string, type: 'documents' | 'products' = 'documents'): string => {
  return `/uploads/${type}/${filename}`;
};

// Delete file
export const deleteFile = (filePath: string): void => {
  const fullPath = path.join(uploadDir, filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};
