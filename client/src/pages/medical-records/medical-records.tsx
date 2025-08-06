import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePatients } from "@/hooks/use-patients";
import { useAppointments } from "@/hooks/use-appointments";
import { Plus, Search, FileText, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function MedicalRecordsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>();
  const { data: patientsData } = usePatients({ pageSize: 100 });
  const { data: appointmentsData } = useAppointments({ patientId: selectedPatientId });

  const selectedPatient = patientsData?.items?.find(p => p.id === selectedPatientId);

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-sm text-gray-500">ID: #{selectedPatient.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm text-gray-900">
                      {format(new Date(selectedPatient.dateOfBirth), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{selectedPatient.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedPatient.email || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical History */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Medical History & Treatments</CardTitle>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Record
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {appointmentsData?.items && appointmentsData.items.length > 0 ? (
                    <div className="space-y-4">
                      {appointmentsData.items.map((appointment) => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {appointment.description || 'General Treatment'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {format(new Date(appointment.appointmentDate), 'MMMM dd, yyyy \'at\' h:mm a')}
                              </p>
                            </div>
                            <Badge className={`status-badge status-${appointment.status}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs font-medium text-gray-500">Treatment Notes</Label>
                              <p className="text-sm text-gray-900 mt-1">
                                {appointment.status === 'completed' 
                                  ? 'Treatment completed successfully. Patient showed good response to procedure.'
                                  : 'Scheduled for routine examination and cleaning.'
                                }
                              </p>
                            </div>
                            
                            <div>
                              <Label className="text-xs font-medium text-gray-500">Duration</Label>
                              <p className="text-sm text-gray-900">{appointment.duration} minutes</p>
                            </div>

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>Treatment ID: #{appointment.id}</span>
                              </div>
                              {appointment.status === 'completed' && (
                                <div className="flex items-center space-x-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  <span>Treatment Complete</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
                      <p className="text-gray-500 mb-4">Start by adding the first medical record.</p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Record
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add New Medical Record Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Medical Record</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="treatment-type">Treatment Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select treatment..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="cleaning">Cleaning</SelectItem>
                            <SelectItem value="filling">Filling</SelectItem>
                            <SelectItem value="extraction">Extraction</SelectItem>
                            <SelectItem value="root-canal">Root Canal</SelectItem>
                            <SelectItem value="whitening">Whitening</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="treatment-date">Treatment Date</Label>
                        <Input type="datetime-local" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="treatment-notes">Treatment Notes</Label>
                      <Textarea 
                        placeholder="Enter detailed treatment notes..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Input placeholder="Enter diagnosis..." />
                      </div>
                      <div>
                        <Label htmlFor="prescription">Prescription</Label>
                        <Input placeholder="Enter prescription..." />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Save Medical Record
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!selectedPatient && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-500">Choose a patient from the dropdown above to view their medical records.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}