import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crop as CropIcon, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  file: File;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

// Common aspect ratios for dental photography
const ASPECT_RATIOS = {
  free: { label: "Free Crop", value: null },
  square: { label: "Square (1:1)", value: 1 },
  dental: { label: "Dental Standard (4:3)", value: 4/3 },
  portrait: { label: "Portrait (3:4)", value: 3/4 },
  landscape: { label: "Landscape (16:9)", value: 16/9 },
  xray: { label: "X-Ray Standard (3:2)", value: 3/2 }
};

export function ImageCropper({ file, isOpen, onClose, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image when file changes
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [file]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    
    // Set initial crop based on aspect ratio
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        aspectRatio || width / height,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }, [aspectRatio]);

  const handleAspectRatioChange = (value: string) => {
    const ratio = value === 'free' ? null : ASPECT_RATIOS[value as keyof typeof ASPECT_RATIOS].value;
    setAspectRatio(ratio);
    
    if (imgRef.current && ratio) {
      const { naturalWidth: width, naturalHeight: height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          ratio,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
    }
  };

  const getCroppedImage = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null;
    }

    const canvas = canvasRef.current;
    const image = imgRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.save();

    // Apply transformations
    if (rotation || flipH || flipV) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.translate(-centerX, -centerY);
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    return canvas;
  }, [completedCrop, rotation, flipH, flipV]);

  const handleCropComplete = () => {
    const canvas = getCroppedImage();
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      
      // Create new file with cropped image
      const croppedFile = new File(
        [blob], 
        `cropped_${file.name}`, 
        { type: file.type }
      );
      
      onCropComplete(croppedFile);
      onClose();
    }, file.type, 0.9);
  };

  const resetTransforms = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Crop Image: {file?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center space-x-2">
              <Label htmlFor="aspect-ratio">Aspect Ratio:</Label>
              <Select value={aspectRatio ? Object.keys(ASPECT_RATIOS).find(key => ASPECT_RATIOS[key as keyof typeof ASPECT_RATIOS].value === aspectRatio) || 'free' : 'free'} onValueChange={handleAspectRatioChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(prev => (prev + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
                Rotate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlipH(!flipH)}
              >
                <FlipHorizontal className="h-4 w-4" />
                Flip H
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlipV(!flipV)}
              >
                <FlipVertical className="h-4 w-4" />
                Flip V
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetTransforms}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Crop Area */}
          <div className="flex justify-center overflow-auto max-h-[50vh]">
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio || undefined}
                minWidth={50}
                minHeight={50}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  }}
                />
              </ReactCrop>
            )}
          </div>

          {/* Preview Canvas (hidden) */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCropComplete} disabled={!completedCrop}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}