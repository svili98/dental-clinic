import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileList } from "@/components/files/file-list";
import { FileUpload } from "@/components/files/file-upload";
import { OdontogramISO } from "@/components/patients/odontogram-iso";
import { MedicalNotes } from "@/components/patients/medical-notes";
import { TreatmentHistoryPanel } from "@/components/patients/treatment-history-panel";
import { FinancialRecordModal } from "@/components/patients/financial-record-modal";
import { AppointmentBookingModal } from "@/components/appointments/appointment-booking-modal";
import { ClinicalPhotoTimeline } from "@/components/patients/clinical-photo-timeline";
import { usePatient } from "@/hooks/use-patients";
import { usePatientFiles } from "@/hooks/use-files";
import { useAppointments } from "@/hooks/use-appointments";
import { useTreatmentHistory } from "@/hooks/use-treatment-history";
import { usePaymentRecords } from "@/hooks/use-payments";
import { useTranslation } from "@/lib/i18n";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { ArrowLeft, Edit, Calendar, FileText, Phone, Mail, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function PatientDetailsPage() {
  const params = useParams();
  const patientId = parseInt(params.id || "0");
  const [financialModalOpen, setFinancialModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const { t } = useTranslation();
  
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: files } = usePatientFiles(patientId);
  const { data: appointmentsData } = useAppointments({ patientId });
  const { data: treatments } = useTreatmentHistory(patientId);
  const { data: payments } = usePaymentRecords(patientId);

  // Calculate financial totals from actual data
  const treatmentsArray = Array.isArray(treatments) ? treatments : [];
  const paymentsArray = Array.isArray(payments) ? payments : [];
  const totalTreatmentCost = treatmentsArray.reduce((sum: number, treatment: any) => sum + treatment.cost, 0);
  const totalPaid = paymentsArray.reduce((sum: number, payment: any) => sum + payment.amount, 0);
  const outstanding = totalTreatmentCost - totalPaid;

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
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Medical Condition Alert */}
            {(patient as any).medicalConditions && (patient as any).medicalConditions.length > 0 && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Medical Conditions Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {((patient as any).medicalConditions as string[]).map((condition: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
                    Please review medical conditions before treatment
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t.patientInformation}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t.fullName}</label>
                      <p className="text-sm text-gray-900">{patient.firstName} {patient.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t.dateOfBirth}</label>
                      <p className="text-sm text-gray-900">
                        {format(new Date(patient.dateOfBirth), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t.gender}</label>
                      <p className="text-sm text-gray-900">{patient.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">JMBG</label>
                      <p className="text-sm text-gray-900">{patient.jmbg}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t.phone}</label>
                        <p className="text-sm text-gray-900">{patient.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t.email}</label>
                        <p className="text-sm text-gray-900">{patient.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t.address}</label>
                        <p className="text-sm text-gray-900">{patient.address || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t.status}</label>
                      <div className="mt-1">
                        <Badge className="status-badge status-active">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t.appointments}</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {appointmentsData?.items && appointmentsData.items.length > 0 ? (
                  <div className="space-y-4">
                    {appointmentsData.items.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-semibold text-foreground">
                                {appointment.description || t.dentalCleaning}
                              </h4>
                              <Badge className={`status-badge status-${appointment.status} text-xs`}>
                                {appointment.status === 'scheduled' ? t.appointmentScheduled :
                                 appointment.status === 'completed' ? t.appointmentCompleted : 
                                 t.appointmentCancelled}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy \'at\' h:mm a')} 
                              <span className="mx-1">•</span>
                              {t.duration}: {appointment.duration} min
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              €{(treatmentsArray.find((t: any) => t.appointmentId === appointment.id)?.cost || 0) / 100}
                            </p>
                            <p className="text-xs text-muted-foreground">{t.fee}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No appointments found</p>
                    <p className="text-xs text-muted-foreground">Schedule an appointment to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{t.financialOverview}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Payment Summary Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-green-600 font-medium">{t.totalPaid}</p>
                      <p className="text-lg font-semibold text-green-700">
                        €{(totalPaid / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-red-600 font-medium">{t.outstanding}</p>
                      <p className="text-lg font-semibold text-red-700">€{(outstanding / 100).toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-blue-600 font-medium">{t.totalTreatments}</p>
                      <p className="text-lg font-semibold text-blue-700">
                        €{(totalTreatmentCost / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Outstanding Treatments */}
                  {outstanding > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-foreground mb-3">{t.unpaidTreatments}</h4>
                      <div className="space-y-2">
                        {treatmentsArray
                          .filter((treatment: any) => {
                            const treatmentPayments = paymentsArray
                              .filter((p: any) => p.treatmentId === treatment.id)
                              .reduce((sum: number, p: any) => sum + p.amount, 0);
                            return treatment.cost > treatmentPayments;
                          })
                          .map((treatment: any) => {
                            const treatmentPayments = paymentsArray
                              .filter((p: any) => p.treatmentId === treatment.id)
                              .reduce((sum: number, p: any) => sum + p.amount, 0);
                            const remainingCost = treatment.cost - treatmentPayments;
                            
                            return (
                              <div key={treatment.id} className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded-lg">
                                <div>
                                  <p className="text-xs font-medium text-red-900">{treatment.treatmentType}</p>
                                  <p className="text-xs text-red-600">
                                    {format(new Date(treatment.performedAt), 'MMM dd, yyyy')}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-red-700">€{(remainingCost / 100).toFixed(2)}</p>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Payment Action */}
                  <div className="pt-2">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      size="sm"
                      onClick={() => setFinancialModalOpen(true)}
                    >
                      {t.recordPayment}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>{t.quickStats}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.totalAppointments}</span>
                    <span className="text-sm font-medium">{appointmentsData?.totalCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.completedTreatments}</span>
                    <span className="text-sm font-medium">
                      {appointmentsData?.items?.filter(a => a.status === 'completed').length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.filesUploaded}</span>
                    <span className="text-sm font-medium">{files?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.lastVisit}</span>
                    <span className="text-sm font-medium">
                      {appointmentsData?.items?.[0] ? 
                        format(new Date(appointmentsData.items[0].appointmentDate), 'MMM dd, yyyy') :
                        'No visits'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.patientSince}</span>
                    <span className="text-sm font-medium">
                      {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t.recentPayments}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentsArray.length > 0 ? (
                    <div className="space-y-2">
                      {paymentsArray.slice(0, 5).map((payment: any) => (
                        <div key={payment.id} className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-lg">
                          <div>
                            <p className="text-xs font-medium text-green-900">{payment.paymentMethod}</p>
                            <p className="text-xs text-green-600">
                              {format(new Date(payment.paidAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-green-700">€{(payment.amount / 100).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No payments recorded</p>
                  )}
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{t.totalPaid}</span>
                      <span className="text-lg font-bold text-green-600">€{(totalPaid / 100).toFixed(2)}</span>
                    </div>
                    {outstanding > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{t.balanceDue}</span>
                        <span className="text-lg font-bold text-red-600">€{(outstanding / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-3">
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setFinancialModalOpen(true)}
                  >
                    Financial Record
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t.quickActions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setAppointmentModalOpen(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    {t.addMedicalNote}
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    {t.sendMessage}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Odontogram Section */}
        <div className="space-y-6">
          <OdontogramISO patientId={patientId} patientAge={patientAge} />
        </div>

        {/* Medical Notes and Treatment History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MedicalNotes patientId={patientId} />
          <TreatmentHistoryPanel patientId={patientId} />
        </div>

        {/* Files and Photos Section */}
        <div className="space-y-6">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="photos">Clinical Photos Timeline</TabsTrigger>
              <TabsTrigger value="files">All Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-6">
              <FileUpload patientId={patientId} />
            </TabsContent>
            
            <TabsContent value="photos">
              <ClinicalPhotoTimeline patientId={patientId} />
            </TabsContent>
            
            <TabsContent value="files">
              <FileList patientId={patientId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Financial Record Modal */}
      <FinancialRecordModal 
        isOpen={financialModalOpen}
        onClose={() => setFinancialModalOpen(false)}
        patientId={patientId}
      />

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
