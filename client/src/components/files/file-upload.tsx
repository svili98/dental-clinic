import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCreatePatientFile } from "@/hooks/use-files";
import { CloudUpload, FileText, Image, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { InsertPatientFile } from "@shared/schema";

interface FileUploadProps {
  patientId?: number;
  onUploadSuccess?: (file: any) => void;
}

export function FileUpload({ patientId, onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createFileMutation = useCreatePatientFile();
  const { toast } = useToast();

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
    return Package;
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!patientId) {
      toast({
        title: "Error",
        description: "Please select a patient first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    for (const file of acceptedFiles) {
      try {
        await simulateUpload(file);
        
        const fileData: InsertPatientFile = {
          patientId,
          fileName: file.name,
          filePath: `/uploads/${file.name}`, // In real app, this would be the actual path
          fileType: file.type,
          fileSize: file.size,
          description: `Uploaded ${file.name}`,
          thumbnailPath: file.type.startsWith('image/') ? `/thumbnails/${file.name}` : undefined,
        };
        
        await createFileMutation.mutateAsync(fileData);
        
        toast({
          title: "Success",
          description: `${file.name} uploaded successfully`,
        });
        
        if (onUploadSuccess) {
          onUploadSuccess(fileData);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    setUploading(false);
    setUploadProgress(0);
  }, [patientId, createFileMutation, toast, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.tiff', '.bmp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'model/stl': ['.stl'],
      'application/zip': ['.zip'],
    },
    multiple: true,
  });

  return (
    <Card>
      <CardContent className="p-6">
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
            Upload Patient Files
          </h4>
          
          <p className="text-sm text-gray-500 mb-4">
            {isDragActive 
              ? 'Drop the files here...' 
              : 'Drag and drop files here, or click to browse'
            }
          </p>
          
          <p className="text-xs text-gray-400 mb-4">
            Supports: Images (JPG, PNG, TIFF), Documents (PDF, DOC), Medical Images (DICOM), 3D Models (STL), Archives (ZIP)
          </p>
          
          <Button 
            type="button" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={uploading}
          >
            Choose Files
          </Button>
        </div>
        
        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Uploading files...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
