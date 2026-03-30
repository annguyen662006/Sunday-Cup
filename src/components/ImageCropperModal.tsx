import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any
  ): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    // Set canvas size to match the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Compress the image to be under 100KB
    return new Promise((resolve) => {
      let quality = 0.9;
      const compress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(null);
              return;
            }
            // If blob is larger than 100KB (102400 bytes) and quality is still > 0.1, reduce quality
            if (blob.size > 102400 && quality > 0.1) {
              quality -= 0.1;
              compress();
            } else {
              resolve(blob);
            }
          },
          'image/jpeg',
          quality
        );
      };
      compress();
    });
  };

  const handleSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) {
        onCropComplete(croppedImageBlob);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <GlassCard className="w-full max-w-lg p-6 relative flex flex-col h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-headline uppercase italic tracking-tighter text-on-surface">Cắt ảnh</h3>
          <button onClick={onCancel} className="text-on-surface/50 hover:text-on-surface">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative flex-1 bg-black/50 rounded-xl overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="mt-6 flex items-center gap-4">
          <span className="text-sm font-bold text-on-surface/70">Thu phóng</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-2 bg-on-surface/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-2 rounded-xl font-bold text-on-surface/70 hover:text-on-surface hover:bg-on-surface/5 transition-colors">
            Hủy
          </button>
          <button onClick={handleSave} className="px-6 py-2 rounded-xl font-bold bg-primary text-on-primary-fixed hover:bg-primary-fixed shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] transition-all flex items-center gap-2">
            <Check className="w-4 h-4" /> Xong
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
