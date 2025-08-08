import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTodayAppointments } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

export function AppointmentList() {
  const { data: appointments, isLoading } = useTodayAppointments();
  const { data: patientsData } = usePatients();

  // Create a map of patient IDs to names for quick lookup
  const patientMap = new Map();
  if (patientsData?.items) {
    patientsData.items.forEach(patient => {
      patientMap.set(patient.id, `${patient.firstName} ${patient.lastName}`);
    });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments && appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50"
              >
                <div className={`w-2 h-2 rounded-full ${
                  appointment.status === 'scheduled' ? 'bg-blue-500' :
                  appointment.status === 'completed' ? 'bg-green-500' :
                  appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {patientMap.get(appointment.patientId) || `Patient #${appointment.patientId}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {appointment.description || 'No description'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {format(new Date(appointment.appointmentDate), 'h:mm a')}
                  </p>
                  <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No appointments scheduled for today
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            View Full Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
