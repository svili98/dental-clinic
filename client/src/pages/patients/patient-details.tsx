import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileList } from "@/components/files/file-list";
import { FileUpload } from "@/components/files/file-upload";
import { OdontogramISO } from "@/components/patients/odontogram-iso";
import { MedicalNotes } from "@/components/patients/medical-notes";
import { TreatmentHistoryPanel } from "@/components/patients/treatment-history-panel";
import { FinancialOverview } from "@/components/patients/financial-overview";
import { TransactionHistory } from "@/components/patients/transaction-history";
import { AppointmentBookingModal } from "@/components/appointments/appointment-booking-modal";
import { ClinicalPhotoTimeline } from "@/components/patients/clinical-photo-timeline";
import { PatientAvatar } from "@/components/patients/patient-avatar";
import { usePatient } from "@/hooks/use-patients";
import { usePatientFiles } from "@/hooks/use-files";
import { useAppointments } from "@/hooks/use-appointments";
import { useTreatmentHistory } from "@/hooks/use-treatment-history";

import { useTranslation } from "@/lib/i18n";
import { formatCurrency } from "@/lib/currency";
import { PATIENT_STATUSES } from "@shared/schema";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { ArrowLeft, Edit, Calendar, FileText, Phone, Mail, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function PatientDetailsPage() {
  const params = useParams();
  const patientId = parseInt(params.id || "0");

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const { t } = useTranslation();
  
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: files } = usePatientFiles(patientId);
  const { data: appointmentsData } = useAppointments({ patientId });
  const { data: treatments } = useTreatmentHistory(patientId);
  const treatmentsArray = Array.isArray(treatments) ? treatments : [];

  // Calculate patient age for odontogram
  const patientAge = patient ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 25;

  if (patientLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Patient Not Found</h2>
              <p className="text-gray-500 mb-4">The patient you're looking for doesn't exist.</p>
              <Link href="/patients">
                <Button>Back to Patients</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/patients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Patient ID: #{patient.id}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link href={`/patients/${patient.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </Button>
            </Link>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setAppointmentModalOpen(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">

            {/* Patient Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <PatientAvatar patient={patient} size="md" />
                  <div>
                    <div className="text-lg font-semibold">{patient.firstName} {patient.lastName}</div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Born {format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}</span>
                      <span>•</span>
                      <span>{patient.gender}</span>
                      <span>•</span>
                      <span>ID #{patient.id}</span>
                      <span>•</span>
                      {(() => {
                        const status = PATIENT_STATUSES[patient.statusId as keyof typeof PATIENT_STATUSES];
                        if (!status) return null;
                        const getVariant = (color: string) => {
                          switch (color) {
                            case 'green': return 'default' as const;
                            case 'gray': return 'secondary' as const;
                            case 'blue': return 'outline' as const;
                            case 'orange': return 'destructive' as const;
                            case 'purple': return 'outline' as const;
                            default: return 'secondary' as const;
                          }
                        };
                        return (
                          <Badge variant={getVariant(status.color)} className="text-xs">
                            {status.name}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.address || 'No address'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Sidebar - Quick Stats */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Appointments</span>
                    <span className="text-sm font-medium">{appointmentsData?.totalCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-sm font-medium">
                      {appointmentsData?.items?.filter(a => a.status === 'completed').length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Files Uploaded</span>
                    <span className="text-sm font-medium">{files?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Patient Since</span>
                    <span className="text-sm font-medium">
                      {patient.createdAt ? format(new Date(patient.createdAt), 'MMM yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medical Records Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="odontogram">Odontogram</TabsTrigger>
            <TabsTrigger value="notes">Medical Notes</TabsTrigger>
            <TabsTrigger value="treatments">Treatments</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            {appointmentsData?.items && appointmentsData.items.length > 0 ? (
              <div className="space-y-4">
                {appointmentsData.items.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-semibold">
                              {appointment.description || 'Dental Cleaning'}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy \'at\' h:mm a')} 
                            <span className="mx-1">•</span>
                            Duration: {appointment.duration} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {formatCurrency(appointment.cost || 0, (appointment.currency as any) || 'EUR')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No appointments found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="financial">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FinancialOverview patientId={patientId} />
              <TransactionHistory patientId={patientId} />
            </div>
          </TabsContent>

          <TabsContent value="odontogram">
            <OdontogramISO patientId={patientId} patientAge={patientAge} />
          </TabsContent>

          <TabsContent value="notes">
            <MedicalNotes patientId={patientId} />
          </TabsContent>

          <TabsContent value="treatments">
            <TreatmentHistoryPanel patientId={patientId} />
          </TabsContent>

          <TabsContent value="files">
            <div className="space-y-6">
              <Tabs defaultValue="upload">
                <TabsList>
                  <TabsTrigger value="upload">Upload Files</TabsTrigger>
                  <TabsTrigger value="list">File List</TabsTrigger>
                  <TabsTrigger value="photos">Clinical Photos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload">
                  <FileUpload patientId={patientId} />
                </TabsContent>
                
                <TabsContent value="list">
                  <FileList patientId={patientId} />
                </TabsContent>
                
                <TabsContent value="photos">
                  <ClinicalPhotoTimeline patientId={patientId} />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>



      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        patientId={patientId}
        patientName={patient ? `${patient.firstName} ${patient.lastName}` : ""}
      />
    </Layout>
  );
}
