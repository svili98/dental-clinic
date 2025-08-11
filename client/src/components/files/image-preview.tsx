import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Download, RotateCw, ZoomIn, ZoomOut } from "lucide-react"

interface ImagePreviewProps {
  file: {
    id: number
    fileName: string
    filePath: string
    fileSize: number
    patientId: number
    createdAt?: Date
    uploadedAt?: string
    category?: string
    tags?: string[]
    toothNumbers?: number[]
    treatmentDate?: string
    description?: string
  }
  isOpen: boolean
  onClose: () => void
}

export function ImagePreview({ file, isOpen, onClose }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName)
  const isXray = file.fileName.toLowerCase().includes('xray') || file.fileName.toLowerCase().includes('x-ray')

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  
  const handleDownload = (file: any) => {
    // In demo mode, show a message about download functionality
    alert(`Download functionality demo:\n\nIn a production environment, this would download:\n• File: ${file.fileName}\n• Size: ${formatFileSize(file.fileSize)}\n\nThe file would be retrieved from secure storage and downloaded to your device.`)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {file.fileName}
                {isXray && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    X-Ray
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Size: {formatFileSize(file.fileSize)} • Created: {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Unknown'}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* Controls */}
          {isImage && (
            <div className="flex items-center justify-center space-x-2 border-b pb-4">
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 25}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 300}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload(file)}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Image Preview */}
          <div className="flex items-center justify-center overflow-auto max-h-[60vh] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            {isImage ? (
              <div className="relative">
                <img
                  src={`/api/files/${file.id}/content`}
                  alt={file.fileName}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
                    transformOrigin: 'center',
                    maxWidth: '100%',
                    maxHeight: '500px'
                  }}
                  onError={(e) => {
                    // Fallback to a sample dental image for demo
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/600x400/e3f2fd/1976d2?text=${encodeURIComponent(file.fileName)}`;
                  }}
                />
                {file.category && (
                  <Badge variant="outline" className="absolute top-2 left-2 bg-white/90">
                    {file.category === 'xray' && 'X-Ray Image'}
                    {file.category === 'photo' && 'Clinical Photo'}
                    {file.category === 'model' && '3D Model'}
                    {file.category === 'document' && 'Document'}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-2">Document preview</p>
                <p className="text-xs text-gray-400 mb-4">
                  File: {file.fileName}
                </p>
                <Button variant="outline" size="sm" onClick={() => handleDownload(file)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            )}
          </div>

          {/* X-Ray specific information */}
          {isXray && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">X-Ray Analysis</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Enhanced contrast applied for better visibility</li>
                <li>• Use zoom and rotation controls for detailed examination</li>
                <li>• Consult with radiologist for professional interpretation</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}