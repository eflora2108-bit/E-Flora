import { v2 as cloudinary } from 'cloudinary';
import env from './env';

export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const uploadProductImageToCloudinary = async (
  localFilePath: string,
  productId: string
): Promise<string> => {
  const result = await cloudinary.uploader.upload(localFilePath, {
    folder: 'eflora/products',
    public_id: `${productId}-${Date.now()}`,
    resource_type: 'image',
    overwrite: false,
  });

  return result.secure_url;
};
