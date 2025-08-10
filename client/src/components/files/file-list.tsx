import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { usePatientFiles, useDeletePatientFile } from "@/hooks/use-files";
import { Eye, Download, Trash2, FileText, Image, Package, Camera, Zap, Box, Search, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ImagePreview } from "./image-preview";

interface FileListProps {
  patientId?: number;
}

// Dental file categories for filtering
const DENTAL_CATEGORIES = {
  all: { label: "All Files", icon: Package },
  xray: { label: "X-Ray Images", icon: Zap },
  photo: { label: "Clinical Photos", icon: Camera },
  model: { label: "3D Models & Scans", icon: Box },
  document: { label: "Documents & Reports", icon: FileText }
};

export function FileList({ patientId }: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof DENTAL_CATEGORIES>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const { data: files, isLoading } = usePatientFiles(patientId || 0);
  const deleteFileMutation = useDeletePatientFile();
  const { toast } = useToast();

  const getFileIcon = (file: any) => {
    const category = file.category || 'document';
    return DENTAL_CATEGORIES[category as keyof typeof DENTAL_CATEGORIES]?.icon || FileText;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      xray: 'text-purple-600 bg-purple-100',
      photo: 'text-blue-600 bg-blue-100', 
      model: 'text-green-600 bg-green-100',
      document: 'text-orange-600 bg-orange-100'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  // Filter and sort files
  const filteredFiles = files?.filter((file) => {
    const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
    const matchesSearch = !searchTerm || 
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  })?.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.fileName.localeCompare(b.fileName);
      case 'size':
        return b.fileSize - a.fileSize;
      case 'date':
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
  }) || [];

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
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Patient Files ({filteredFiles.length})</span>
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="flex flex-col space-y-3">
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files, descriptions, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: "date" | "name" | "size") => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as keyof typeof DENTAL_CATEGORIES)}>
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(DENTAL_CATEGORIES).map(([key, config]) => {
                const IconComponent = config.icon;
                const categoryCount = key === 'all' ? files?.length || 0 : files?.filter(f => f.category === key).length || 0;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center space-x-1">
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden md:inline">{config.label.split(' ')[0]}</span>
                    <Badge variant="secondary" className="ml-1">{categoryCount}</Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredFiles && filteredFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file);
              const categoryColors = getCategoryColor(file.category || 'document');
              return (
                <div 
                  key={file.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${categoryColors}`}>
                      <FileIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.fileName}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span>•</span>
                        <span>{format(new Date(file.uploadedAt), 'MMM dd, yyyy')}</span>
                        {file.category && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {DENTAL_CATEGORIES[file.category as keyof typeof DENTAL_CATEGORIES]?.label || file.category}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* File Metadata */}
                  <div className="space-y-2 mb-3">
                    {file.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {file.description}
                      </p>
                    )}
                    
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {file.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{file.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {file.toothNumbers && file.toothNumbers.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Teeth:</span>
                        {file.toothNumbers.slice(0, 5).map((tooth: number, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tooth}
                          </Badge>
                        ))}
                        {file.toothNumbers.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{file.toothNumbers.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {file.treatmentDate && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Treatment: {format(new Date(file.treatmentDate), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                  
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
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-500">
              {searchTerm || activeCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Upload files to get started'}
            </p>
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
