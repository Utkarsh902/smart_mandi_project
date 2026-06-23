export const compressImage = async (file: File, maxSizeKB: number = 200): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions to prevent huge memory usage
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        const compress = () => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob failed'));
              return;
            }
            if (blob.size / 1024 > maxSizeKB && quality > 0.1) {
              quality -= 0.1;
              compress();
            } else {
              resolve(blob);
            }
          }, 'image/webp', quality);
        };
        compress();
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
