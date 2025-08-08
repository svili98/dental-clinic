import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { usePatientFiles, useDeletePatientFile } from "@/hooks/use-files";
import { Eye, Download, Trash2, FileText, Image, Package } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ImagePreview } from "./image-preview";

interface FileListProps {
  patientId?: number;
}

export function FileList({ patientId }: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { data: files, isLoading } = usePatientFiles(patientId || 0);
  const deleteFileMutation = useDeletePatientFile();
  const { toast } = useToast();

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
    return Package;
  };

  const getFileIconColor = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'text-blue-500';
    if (fileType.includes('pdf')) return 'text-red-500';
    if (fileType.includes('document')) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getFileIconBg = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'bg-blue-100';
    if (fileType.includes('pdf')) return 'bg-red-100';
    if (fileType.includes('document')) return 'bg-green-100';
    return 'bg-yellow-100';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = async (fileId: number, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await deleteFileMutation.mutateAsync(fileId);
        toast({
          title: "Success",
          description: `File "${fileName}" deleted successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to delete "${fileName}"`,
          variant: "destructive",
        });
      }
    }
  };

  const handlePreview = (file: any) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  if (!patientId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Please select a patient to view their files
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Files</CardTitle>
      </CardHeader>
      <CardContent>
        {files && files.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.fileType);
              return (
                <div 
                  key={file.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-12 h-12 ${getFileIconBg(file.fileType)} rounded-lg flex items-center justify-center`}>
                      <FileIcon className={`h-6 w-6 ${getFileIconColor(file.fileType)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.fileSize)} • {format(new Date(file.uploadedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  {file.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {file.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => handlePreview(file)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(file.id, file.fileName)}
                      disabled={deleteFileMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No files uploaded yet
          </div>
        )}
      </CardContent>
      
      {/* Image Preview Modal */}
      {selectedFile && (
        <ImagePreview
          file={selectedFile}
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedFile(null);
          }}
        />
      )}
    </Card>
  );
}
