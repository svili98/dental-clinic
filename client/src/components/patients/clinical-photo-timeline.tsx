import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Camera, ZoomIn, Download, Filter } from "lucide-react";
import { ImagePreview } from "../files/image-preview";
import { usePatientFiles } from "@/hooks/use-files";
import { format, parseISO, isSameMonth, isSameYear } from "date-fns";

interface ClinicalPhotoTimelineProps {
  patientId: number;
}

interface GroupedPhoto {
  id: number;
  fileName: string;
  filePath: string;
  uploadDate: string;
  treatmentDate?: string;
  tags: string[];
  description?: string;
}

interface PhotoGroup {
  date: string;
  photos: GroupedPhoto[];
  appointmentCount: number;
}

export function ClinicalPhotoTimeline({ patientId }: ClinicalPhotoTimelineProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GroupedPhoto | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [timeFilter, setTimeFilter] = useState<'all' | '6months' | '1year'>('all');
  
  const { data: filesData } = usePatientFiles(patientId);
  
  // Filter only clinical photos - more comprehensive filtering
  const clinicalPhotos = (filesData || []).filter(file => {
    const isImageFile = file.fileName.match(/\.(jpg|jpeg|png|heic|gif|webp)$/i);
    // Check multiple possible category formats
    const categoryLower = (file.category || '').toLowerCase();
    const descriptionLower = (file.description || '').toLowerCase();
    
    const isClinicalPhoto = 
      categoryLower === 'photo' || 
      categoryLower === 'clinical photos' ||
      categoryLower.includes('clinical') ||
      categoryLower.includes('photo') ||
      descriptionLower.includes('clinical photos');
    
    return isImageFile && isClinicalPhoto;
  });

  // Group photos by treatment date or upload date
  const groupedPhotos = clinicalPhotos.reduce((groups: Record<string, PhotoGroup>, photo) => {
    // Handle both Date objects and string dates safely
    let uploadDate: string;
    try {
      if (photo.uploadedAt instanceof Date) {
        uploadDate = photo.uploadedAt.toISOString();
      } else if (typeof photo.uploadedAt === 'string') {
        uploadDate = photo.uploadedAt;
      } else {
        uploadDate = new Date().toISOString(); // fallback to current date
      }
    } catch (error) {
      uploadDate = new Date().toISOString(); // fallback to current date
    }
    
    const dateToUse = photo.treatmentDate || uploadDate;
    const dateKey = format(parseISO(dateToUse), 'yyyy-MM-dd');
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        photos: [],
        appointmentCount: 1
      };
    }
    
    groups[dateKey].photos.push({
      id: photo.id,
      fileName: photo.fileName,
      filePath: photo.filePath,
      uploadDate: uploadDate,
      treatmentDate: photo.treatmentDate || undefined,
      tags: photo.tags || [],
      description: photo.description || undefined
    });
    
    return groups;
  }, {});

  // Sort groups by date (newest first)
  const sortedGroups = Object.values(groupedPhotos).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Apply time filter
  const filteredGroups = sortedGroups.filter(group => {
    if (timeFilter === 'all') return true;
    
    const groupDate = parseISO(group.date);
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeFilter === '6months') {
      cutoffDate.setMonth(now.getMonth() - 6);
    } else if (timeFilter === '1year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    return groupDate >= cutoffDate;
  });

  const handlePhotoClick = (photo: GroupedPhoto) => {
    setSelectedPhoto(photo);
    setShowPreview(true);
  };

  const getTimelineBadgeColor = (date: string) => {
    const photoDate = parseISO(date);
    const now = new Date();
    
    if (isSameMonth(photoDate, now) && isSameYear(photoDate, now)) {
      return "bg-green-100 text-green-800";
    } else if (isSameYear(photoDate, now)) {
      return "bg-blue-100 text-blue-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Clinical Photo Timeline</h3>
          <Badge variant="secondary">{clinicalPhotos.length} photos</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value as 'all' | '6months' | '1year')}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Time</option>
            <option value="1year">Last Year</option>
            <option value="6months">Last 6 Months</option>
          </select>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {filteredGroups.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No clinical photos found for this time period</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredGroups.map((group) => (
                  <Card key={group.date} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(parseISO(group.date), 'MMMM dd, yyyy')}</span>
                          <Badge className={getTimelineBadgeColor(group.date)}>
                            {group.photos.length} photo{group.photos.length > 1 ? 's' : ''}
                          </Badge>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {group.photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <div 
                              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handlePhotoClick(photo)}
                            >
                              <div className="w-full h-full relative bg-gradient-to-br from-blue-50 to-blue-100">
                                <img
                                  src={`/api/files/${photo.id}/content`}
                                  alt={photo.fileName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden w-full h-full flex items-center justify-center">
                                  <Camera className="h-8 w-8 text-blue-400" />
                                </div>
                              </div>
                              
                              {/* Overlay on hover */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            
                            {/* Photo details */}
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-medium truncate">{photo.fileName}</p>
                              {photo.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {photo.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {photo.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      +{photo.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredGroups.flatMap(group => group.photos).map((photo) => (
              <div key={photo.id} className="relative group">
                <div 
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handlePhotoClick(photo)}
                >
                  <div className="w-full h-full relative bg-gradient-to-br from-blue-50 to-blue-100">
                    <img
                      src={`https://via.placeholder.com/200x200/e3f2fd/1976d2?text=${encodeURIComponent(photo.fileName.split('.')[0])}`}
                      alt={photo.fileName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                  
                  {/* Date badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className="text-xs bg-black bg-opacity-70 text-white">
                      {format(parseISO(photo.treatmentDate || photo.uploadDate), 'MMM dd')}
                    </Badge>
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Preview Modal */}
      {selectedPhoto && (
        <ImagePreview
          file={{
            id: selectedPhoto.id,
            fileName: selectedPhoto.fileName,
            filePath: selectedPhoto.filePath,
            fileSize: 0,
            patientId: patientId
          }}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedPhoto(null);
          }}
        />
      )}
    </div>
  );
}