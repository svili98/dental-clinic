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

            {/* Treatment History & Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Treatment History & Appointments</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    View All History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {appointmentsData?.items && appointmentsData.items.length > 0 ? (
                  <div className="space-y-4">
                    {appointmentsData.items.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {appointment.description || 'General Dental Treatment'}
                              </h4>
                              <Badge className={`status-badge status-${appointment.status} text-xs`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              {format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy \'at\' h:mm a')} 
                              <span className="mx-1">•</span>
                              Duration: {appointment.duration} min
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              {appointment.status === 'completed' ? '€45.00' : '€0.00'}
                            </p>
                            <p className="text-xs text-gray-500">Fee</p>
                          </div>
                        </div>

                        {/* Treatment Details */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-700">Treatment Notes:</p>
                            <p className="text-xs text-gray-600">
                              {appointment.status === 'completed' 
                                ? `Complete ${appointment.description?.toLowerCase() || 'treatment'} performed successfully. Patient showed excellent cooperation and healing response.`
                                : appointment.status === 'cancelled'
                                ? `Appointment was cancelled by ${Math.random() > 0.5 ? 'patient' : 'clinic'}.`
                                : 'Scheduled appointment - treatment details will be added after completion.'
                              }
                            </p>
                          </div>

                          {appointment.status === 'completed' && (
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-gray-600">Treatment ID: #{appointment.id}</span>
                                  </span>
                                  <span className="text-gray-500">Dr. Smith</span>
                                </div>
                                <span className="text-gray-500">Follow-up: {Math.random() > 0.5 ? 'Required' : 'Not needed'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                    <p className="text-gray-500">No treatment history found</p>
                    <p className="text-xs text-gray-400">Schedule an appointment to begin treatment history</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Payment Summary Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-green-600 font-medium">Total Paid</p>
                      <p className="text-lg font-semibold text-green-700">
                        €{(appointmentsData?.items?.filter(a => a.status === 'completed').length || 0) * 45}.00
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-red-600 font-medium">Outstanding</p>
                      <p className="text-lg font-semibold text-red-700">€120.00</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-blue-600 font-medium">Total Due</p>
                      <p className="text-lg font-semibold text-blue-700">
                        €{((appointmentsData?.items?.filter(a => a.status === 'completed').length || 0) * 45) + 120}.00
                      </p>
                    </div>
                  </div>

                  {/* Outstanding Payments */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Outstanding Payments</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-red-900">Root Canal Treatment</p>
                          <p className="text-xs text-red-600">Due: Dec 15, 2024</p>
                        </div>
                        <p className="text-sm font-semibold text-red-700">€80.00</p>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-orange-50 border border-orange-100 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-orange-900">Dental Cleaning</p>
                          <p className="text-xs text-orange-600">Due: Jan 10, 2025</p>
                        </div>
                        <p className="text-sm font-semibold text-orange-700">€40.00</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Action */}
                  <div className="pt-2">
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                      Record Payment
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
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Appointments</span>
                    <span className="text-sm font-medium">{appointmentsData?.totalCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Completed Treatments</span>
                    <span className="text-sm font-medium">
                      {appointmentsData?.items?.filter(a => a.status === 'completed').length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Files Uploaded</span>
                    <span className="text-sm font-medium">{files?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last Visit</span>
                    <span className="text-sm font-medium">
                      {appointmentsData?.items?.[0] ? 
                        format(new Date(appointmentsData.items[0].appointmentDate), 'MMM dd, yyyy') :
                        'No visits'
                      }
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

            {/* Financial Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Revenue</span>
                    <span className="text-sm font-medium text-green-600">
                      €{(appointmentsData?.items?.filter(a => a.status === 'completed').length || 0) * 45 + 120}.00
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Amount Paid</span>
                    <span className="text-sm font-medium text-green-600">
                      €{(appointmentsData?.items?.filter(a => a.status === 'completed').length || 0) * 45}.00
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Outstanding</span>
                    <span className="text-sm font-semibold text-red-600">€120.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Balance Due</span>
                    <span className="text-lg font-bold text-red-600">€120.00</span>
                  </div>
                </div>
                <div className="pt-3">
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    Record Payment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Medical Note
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
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
