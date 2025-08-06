import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileList } from "@/components/files/file-list";
import { FileUpload } from "@/components/files/file-upload";
import { usePatient } from "@/hooks/use-patients";
import { usePatientFiles } from "@/hooks/use-files";
import { useAppointments } from "@/hooks/use-appointments";
import { Link, useParams } from "wouter";
import { ArrowLeft, Edit, Calendar, FileText, Phone, Mail, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function PatientDetailsPage() {
  const params = useParams();
  const patientId = parseInt(params.id || "0");
  
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: files } = usePatientFiles(patientId);
  const { data: appointmentsData } = useAppointments({ patientId });

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
              <h1 className="text-2xl font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-500">Patient ID: #{patient.id}</p>
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
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-sm text-gray-900">{patient.firstName} {patient.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-sm text-gray-900">
                        {format(new Date(patient.dateOfBirth), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gender</label>
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
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm text-gray-900">{patient.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{patient.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm text-gray-900">{patient.address || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
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
                  <CardTitle>Recent Appointments</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {appointmentsData?.items && appointmentsData.items.length > 0 ? (
                  <div className="space-y-3">
                    {appointmentsData.items.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.description || 'No description'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(appointment.appointmentDate), 'MMMM dd, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                        <Badge className={`status-badge status-${appointment.status}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No appointments found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Appointments</span>
                    <span className="text-sm font-medium">{appointmentsData?.totalCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Files Uploaded</span>
                    <span className="text-sm font-medium">{files?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last Visit</span>
                    <span className="text-sm font-medium">
                      {format(new Date(patient.updatedAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Patient Since</span>
                    <span className="text-sm font-medium">
                      {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Files Section */}
        <div className="space-y-6">
          <FileUpload patientId={patientId} />
          <FileList patientId={patientId} />
        </div>
      </div>
    </Layout>
  );
}
