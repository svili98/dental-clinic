import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatients } from "@/hooks/use-patients";
import { useAppointments } from "@/hooks/use-appointments";
import { useMedicalNotes } from "@/hooks/use-medical-notes";
import { usePatientToothRecords } from "@/hooks/use-tooth-records";
import { useTreatmentHistory } from "@/hooks/use-treatment-history";
import { usePatientFiles } from "@/hooks/use-files";
import { MedicalNotes } from "@/components/patients/medical-notes";
import { OdontogramISO } from "@/components/patients/odontogram-iso";
import { TreatmentHistoryPanel } from "@/components/patients/treatment-history-panel";
import { FileList } from "@/components/files/file-list";
import { ClinicalPhotoTimeline } from "@/components/patients/clinical-photo-timeline";
import { PatientAvatar } from "@/components/patients/patient-avatar";
import { Plus, Search, FileText, Calendar, AlertTriangle, User, ExternalLink, ClipboardList, Heart, Camera } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function MedicalRecordsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: patientsData } = usePatients({ pageSize: 100 });
  const { data: appointmentsData } = useAppointments({ patientId: selectedPatientId });
  const { data: medicalNotes } = useMedicalNotes(selectedPatientId || 0);
  const { data: toothRecords } = usePatientToothRecords(selectedPatientId || 0);
  const { data: treatments } = useTreatmentHistory(selectedPatientId || 0);
  const { data: files } = usePatientFiles(selectedPatientId || 0);

  const selectedPatient = patientsData?.items?.find(p => p.id === selectedPatientId);
  
  // Calculate statistics
  const notesCount = Array.isArray(medicalNotes) ? medicalNotes.length : 0;
  const treatmentsCount = Array.isArray(treatments) ? treatments.length : 0;
  const filesCount = Array.isArray(files) ? files.length : 0;
  const toothRecordsCount = Array.isArray(toothRecords) ? toothRecords.length : 0;
  const clinicalPhotos = (files || []).filter(file => {
    const isImageFile = file.fileName.match(/\.(jpg|jpeg|png|heic|gif|webp)$/i);
    const categoryLower = (file.category || '').toLowerCase();
    return isImageFile && (categoryLower.includes('clinical') || categoryLower.includes('photo'));
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Records Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm">
              <Label htmlFor="patient-select">Select Patient</Label>
              <Select onValueChange={(value) => setSelectedPatientId(parseInt(value))}>
                <SelectTrigger id="patient-select">
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patientsData?.items?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.firstName} {patient.lastName} (#{patient.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Header with Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <PatientAvatar 
                      patient={selectedPatient} 
                      size="xl"
                      className="border-2 border-white dark:border-gray-800 shadow-lg"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Patient ID: #{selectedPatient.id} • DOB: {format(new Date(selectedPatient.dateOfBirth), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Link href={`/patients/${selectedPatient.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Record
                      </Button>
                    </Link>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700" 
                      size="sm"
                      onClick={() => setActiveTab("notes")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Record
                    </Button>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                    <ClipboardList className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">{notesCount}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Medical Notes</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                    <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{treatmentsCount}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Treatments</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">{toothRecordsCount}</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Tooth Records</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{filesCount}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Files</p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-3 text-center">
                    <Camera className="h-5 w-5 text-pink-600 dark:text-pink-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-pink-700 dark:text-pink-300">{clinicalPhotos.length}</p>
                    <p className="text-xs text-pink-600 dark:text-pink-400">Clinical Photos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Records Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="notes">Medical Notes</TabsTrigger>
                <TabsTrigger value="odontogram">Odontogram</TabsTrigger>
                <TabsTrigger value="treatments">Treatments</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="photos">Clinical Photos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Medical Notes */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <ClipboardList className="h-5 w-5 mr-2" />
                          Recent Medical Notes
                        </CardTitle>
                        <Badge variant="secondary">{notesCount} total</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {notesCount > 0 ? (
                        <div className="space-y-3">
                          {(medicalNotes as any[])?.slice(0, 3).map((note: any) => (
                            <div key={note.id} className="border border-border rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-foreground">{note.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {note.noteType}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(note.createdAt), 'MMM dd, yyyy')} • {note.createdBy}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <ClipboardList className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">No medical notes available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Appointments/Treatments */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2" />
                          Recent Appointments
                        </CardTitle>
                        <Badge variant="secondary">{appointmentsData?.totalCount || 0} total</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {appointmentsData?.items && appointmentsData.items.length > 0 ? (
                        <div className="space-y-3">
                          {appointmentsData.items.slice(0, 3).map((appointment) => (
                            <div key={appointment.id} className="border border-border rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-foreground">
                                  {appointment.description || 'General Treatment'}
                                </h4>
                                <Badge className={`status-badge status-${appointment.status} text-xs`}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy \'at\' h:mm a')}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Duration: {appointment.duration} min
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">No appointments available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="notes">
                <MedicalNotes patientId={selectedPatient.id} />
              </TabsContent>
              
              <TabsContent value="odontogram">
                <OdontogramISO 
                  patientId={selectedPatient.id} 
                  patientAge={new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()}
                />
              </TabsContent>
              
              <TabsContent value="treatments">
                <TreatmentHistoryPanel patientId={selectedPatient.id} />
              </TabsContent>
              
              <TabsContent value="files">
                <div className="space-y-6">
                  <FileList patientId={selectedPatient.id} />
                </div>
              </TabsContent>
              
              <TabsContent value="photos">
                <ClinicalPhotoTimeline patientId={selectedPatient.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </Layout>
  );
}