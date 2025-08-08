import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Plus } from "lucide-react";
import { useAppointments } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { AppointmentBookingModal } from "./appointment-booking-modal";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";

export function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  // Get current month's date range
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Fetch appointments for the current month
  const { data: appointmentsData } = useAppointments({
    // We could add date range filtering here
  });
  const { data: patientsData } = usePatients();
  
  const appointments = appointmentsData?.items || [];
  const patients = patientsData?.items || [];
  
  // Create patient lookup map
  const patientMap = new Map();
  patients.forEach(patient => {
    patientMap.set(patient.id, `${patient.firstName} ${patient.lastName}`);
  });
  
  // Generate calendar days
  const calendarDays = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });
  
  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.appointmentDate), date)
    );
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleNewAppointment = () => {
    setBookingModalOpen(true);
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleNewAppointment} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(date => {
              const dayAppointments = getAppointmentsForDate(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              
              return (
                <div
                  key={date.toISOString()}
                  className={`
                    min-h-[100px] p-2 border border-border rounded-lg cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-background hover:bg-muted' : 'bg-muted/50 text-muted-foreground'}
                    ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : ''}`}>
                      {format(date, 'd')}
                    </span>
                    {dayAppointments.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayAppointments.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Appointment indicators */}
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(appointment => (
                      <div
                        key={appointment.id}
                        className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                        title={`${format(new Date(appointment.appointmentDate), 'HH:mm')} - ${patientMap.get(appointment.patientId)}`}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(appointment.appointmentDate), 'HH:mm')}</span>
                        </div>
                        <div className="truncate">
                          {patientMap.get(appointment.patientId)}
                        </div>
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getAppointmentsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate).map(appointment => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(appointment.appointmentDate), 'HH:mm')}
                          </span>
                          <Badge variant="outline">
                            {appointment.duration}min
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {patientMap.get(appointment.patientId)}
                          </span>
                        </div>
                        {appointment.serviceName && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Service: {appointment.serviceName}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        appointment.status === 'completed' ? 'default' : 
                        appointment.status === 'cancelled' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No appointments scheduled for this date</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleNewAppointment}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
      />
    </div>
  );
}