const MAX_FILE_BYTES = 8 * 1024 * 1024;

/** Center-crop to square and resize for circular avatar display. */
export function prepareAvatarImage(file: File, outputSize = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (JPG, PNG, etc.).'));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error('Image is too large. Please use a file under 8 MB.'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not process image.'));
        return;
      }

      ctx.drawImage(img, sx, sy, side, side, 0, 0, outputSize, outputSize);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image.'));
    };

    img.src = objectUrl;
  });
}
