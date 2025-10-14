import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCreatePatientFile } from "@/hooks/use-files";
import { CloudUpload, FileText, Image, Package, Camera, Scan, Zap, Box, X, Crop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageCropper } from "./image-cropper";
import type { InsertPatientFile } from "@shared/schema";

interface FileUploadProps {
  patientId?: number;
  onUploadSuccess?: (file: any) => void;
}

// Dental file categories and their accepted file types
const DENTAL_CATEGORIES = {
  xray: {
    label: "X-Ray Images",
    icon: Zap,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
      'application/dicom': ['.dcm']
    },
    tags: ["panoramic", "bitewing", "periapical", "cephalometric", "cone-beam", "3D-CBCT"]
  },
  photo: {
    label: "Clinical Photos", 
    icon: Camera,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic']
    },
    tags: ["intraoral", "extraoral", "frontal", "lateral", "occlusal", "pre-treatment", "post-treatment", "progress"]
  },
  model: {
    label: "3D Models & Scans",
    icon: Box,
    accept: {
      'model/stl': ['.stl'],
      'model/obj': ['.obj'],
      'model/ply': ['.ply'],
      'application/zip': ['.zip'],
      'application/x-compressed': ['.zip']
    },
    tags: ["intraoral-scan", "impression", "crown", "bridge", "aligner", "surgical-guide"]
  },
  document: {
    label: "Documents & Reports",
    icon: FileText,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    tags: ["lab-report", "referral", "consent", "treatment-plan", "insurance", "prescription"]
  }
};

export function FileUpload({ patientId, onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof DENTAL_CATEGORIES>("photo");
  const [fileMetadata, setFileMetadata] = useState({
    description: "",
    tags: [] as string[],
    toothNumbers: [] as number[],
    treatmentDate: ""
  });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const createFileMutation = useCreatePatientFile();
  const { toast } = useToast();

  const getFileIcon = (fileType: string, category: keyof typeof DENTAL_CATEGORIES) => {
    return DENTAL_CATEGORIES[category].icon;
  };

  const getCategoryByFileType = (fileType: string): keyof typeof DENTAL_CATEGORIES => {
    // Auto-detect category based on file type - check each category in priority order
    if (fileType.startsWith('image/')) {
      // For images, default to clinical photos unless it's a medical image format
      if (fileType.includes('dicom') || fileType.includes('tiff')) {
        return 'xray';
      }
      return 'photo';
    }
    
    if (fileType.startsWith('model/') || fileType.includes('stl') || fileType.includes('obj')) {
      return 'model';
    }
    
    if (fileType.startsWith('application/pdf') || fileType.startsWith('application/msword') || fileType.startsWith('text/')) {
      return 'document';
    }
    
    return 'document'; // default fallback
  };

  const addTag = (tag: string) => {
    if (tag && !fileMetadata.tags.includes(tag)) {
      setFileMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFileMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addToothNumber = (toothNum: string) => {
    const num = parseInt(toothNum);
    if (num >= 1 && num <= 32 && !fileMetadata.toothNumbers.includes(num)) {
      setFileMetadata(prev => ({
        ...prev,
        toothNumbers: [...prev.toothNumbers, num]
      }));
    }
  };

  const removeToothNumber = (toothNum: number) => {
    setFileMetadata(prev => ({
      ...prev,
      toothNumbers: prev.toothNumbers.filter(n => n !== toothNum)
    }));
  };

  const simulateUpload = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        setUploadProgress(progress);
      }, 200);
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!patientId) {
      toast({
        title: "Error",
        description: "Please select a patient first",
        variant: "destructive",
      });
      return;
    }

    // Auto-detect category from first file if only one file
    if (acceptedFiles.length === 1) {
      const detectedCategory = getCategoryByFileType(acceptedFiles[0].type);
      setSelectedCategory(detectedCategory);
      toast({
        title: "Category Auto-detected",
        description: `File categorized as: ${DENTAL_CATEGORIES[detectedCategory].label}`,
      });
    }

    setPendingFiles(acceptedFiles);
  }, [patientId, toast]);

  const handleUpload = async () => {
    if (!patientId || pendingFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    for (const file of pendingFiles) {
      try {
        await simulateUpload(file);
        
        const fileData: InsertPatientFile = {
          patientId,
          fileName: file.name,
          filePath: `/uploads/${file.name}`,
          fileType: file.type,
          fileSize: file.size,
          description: fileMetadata.description || `${DENTAL_CATEGORIES[selectedCategory].label} - ${file.name}`,
          thumbnailPath: file.type.startsWith('image/') ? `/thumbnails/${file.name}` : null,
          category: selectedCategory,
          tags: fileMetadata.tags.length > 0 ? fileMetadata.tags : null,
          toothNumbers: fileMetadata.toothNumbers.length > 0 ? fileMetadata.toothNumbers : null,
          treatmentDate: fileMetadata.treatmentDate || null,
          metadata: {
            originalName: file.name,
            uploadedBy: "current_user",
            fileCategory: selectedCategory,
            ...(file.type.startsWith('image/') && {
              isImage: true,
              needsSpecialViewing: selectedCategory === 'xray'
            })
          }
        };

        await createFileMutation.mutateAsync({ 
          file, 
          metadata: fileData 
        });
        
        toast({
          title: "Success",
          description: `${file.name} uploaded successfully`,
        });
        
        if (onUploadSuccess) {
          onUploadSuccess(fileData);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    // Reset form
    setUploading(false);
    setUploadProgress(0);
    setPendingFiles([]);
    setFileMetadata({
      description: "",
      tags: [],
      toothNumbers: [],
      treatmentDate: ""
    });
  };

  // Combine all accepted file types from categories
  const getAllAcceptedTypes = () => {
    const allTypes: Record<string, string[]> = {};
    Object.values(DENTAL_CATEGORIES).forEach(category => {
      Object.entries(category.accept).forEach(([type, extensions]) => {
        allTypes[type] = extensions;
      });
    });
    return allTypes;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAllAcceptedTypes(),
    multiple: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CloudUpload className="h-5 w-5" />
          <span>Upload Patient Files</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Category Selection */}
        <div className="space-y-2">
          <Label>File Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(DENTAL_CATEGORIES).map(([key, config]) => {
              const IconComponent = config.icon;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  className="h-20 flex-col space-y-2"
                  onClick={() => setSelectedCategory(key as keyof typeof DENTAL_CATEGORIES)}
                  type="button"
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-xs">{config.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          <input {...getInputProps()} />
          
          <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {pendingFiles.length > 0 ? 'Files Ready to Upload' : `Drop ${DENTAL_CATEGORIES[selectedCategory].label} here`}
          </h4>
          
          <p className="text-sm text-gray-500 mb-4">
            {isDragActive 
              ? 'Drop the files here...' 
              : 'Drag and drop files here, or click to browse'
            }
          </p>
          
          <Button 
            type="button" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={uploading}
          >
            Choose Files
          </Button>
        </div>

        {/* Pending Files Preview */}
        {pendingFiles.length > 0 && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <h5 className="font-medium">Selected Files ({pendingFiles.length})</h5>
              {pendingFiles.map((file, index) => {
                const IconComponent = getFileIcon(file.type, selectedCategory);
                return (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.type.startsWith('image/') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCropperFile(file);
                            setShowCropper(true);
                          }}
                        >
                          <Crop className="h-3 w-3 mr-1" />
                          Crop
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingFiles(files => files.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metadata Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about these files..."
                  value={fileMetadata.description}
                  onChange={(e) => setFileMetadata(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatmentDate">Treatment Date</Label>
                <Input
                  id="treatmentDate"
                  type="date"
                  value={fileMetadata.treatmentDate}
                  onChange={(e) => setFileMetadata(prev => ({ ...prev, treatmentDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {fileMetadata.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {DENTAL_CATEGORIES[selectedCategory].tags.map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => addTag(tag)}
                    disabled={fileMetadata.tags.includes(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tooth Numbers */}
            <div className="space-y-2">
              <Label>Associated Teeth (Optional)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {fileMetadata.toothNumbers.map((tooth) => (
                  <Badge key={tooth} variant="secondary" className="cursor-pointer" onClick={() => removeToothNumber(tooth)}>
                    #{tooth}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Enter tooth number (1-32)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToothNumber((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? 'Uploading...' : `Upload ${pendingFiles.length} file(s)`}
            </Button>
          </div>
        )}
        
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Uploading files...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Image Cropper Modal */}
        {cropperFile && (
          <ImageCropper
            file={cropperFile}
            isOpen={showCropper}
            onClose={() => {
              setShowCropper(false);
              setCropperFile(null);
            }}
            onCropComplete={(croppedFile) => {
              // Replace the original file with the cropped version
              setPendingFiles(files => 
                files.map(f => f === cropperFile ? croppedFile : f)
              );
              toast({
                title: "Image Cropped",
                description: "Image has been cropped and is ready for upload",
              });
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
