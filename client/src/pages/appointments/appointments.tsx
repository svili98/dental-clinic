import { Layout } from "@/components/layout/layout";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus } from "lucide-react";
import { useAppointments } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { format } from "date-fns";

export default function AppointmentsPage() {
  const { data: appointmentsData, isLoading } = useAppointments();
  const { data: patientsData } = usePatients();

  // Create a map of patient IDs to names for quick lookup
  const patientMap = new Map();
  if (patientsData?.items) {
    patientsData.items.forEach(patient => {
      patientMap.set(patient.id, `${patient.firstName} ${patient.lastName}`);
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'status-scheduled';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-scheduled';
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Appointments</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : appointmentsData?.items && appointmentsData.items.length > 0 ? (
              <div className="space-y-4">
                {appointmentsData.items.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {patientMap.get(appointment.patientId) || `Patient #${appointment.patientId}`}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {appointment.description || 'No description'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(appointment.appointmentDate), 'MMMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(appointment.appointmentDate), 'h:mm a')}</span>
                            </div>
                            <span>Duration: {appointment.duration} minutes</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`status-badge ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500 mb-4">Get started by scheduling your first appointment.</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
