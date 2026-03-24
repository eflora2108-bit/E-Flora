export const getBackendBaseUrl = (): string => {
  return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
};

export const resolveImageUrl = (image: any): string => {
  if (!image) return '';

  if (typeof image === 'string') {
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${getBackendBaseUrl()}${image}`;
  }

  if (typeof image === 'object') {
    const candidate = image.url || image.secure_url || image.path || image.src;
    if (typeof candidate === 'string') {
      if (candidate.startsWith('http://') || candidate.startsWith('https://')) return candidate;
      return `${getBackendBaseUrl()}${candidate}`;
    }
  }

  return '';
};
