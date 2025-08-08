import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, User, Stethoscope } from "lucide-react";
import { useSetmoreServices, useSetmoreStaff, useSetmoreSlots, useCreateSetmoreAppointment } from "@/hooks/use-setmore";
import { usePatients } from "@/hooks/use-patients";
import { useToast } from "@/hooks/use-toast";
import { format, addMinutes, parse } from "date-fns";

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number;
  patientName?: string;
  preselectedDate?: string;
}

export function AppointmentBookingModal({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName, 
  preselectedDate 
}: AppointmentBookingModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<number>(patientId || 0);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(preselectedDate || "");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  const { data: servicesData } = useSetmoreServices();
  const { data: staffData } = useSetmoreStaff();
  const { data: patientsData } = usePatients();
  const getSlotsMutation = useSetmoreSlots();
  const createAppointmentMutation = useCreateSetmoreAppointment();
  const { toast } = useToast();

  const services = servicesData?.data?.services || [];
  const staff = staffData?.data?.staffs || [];
  const patients = patientsData?.items || [];

  // Get available slots when service, staff, and date are selected
  useEffect(() => {
    if (selectedService && selectedStaff && selectedDate) {
      const formattedDate = format(new Date(selectedDate), "dd/MM/yyyy");
      getSlotsMutation.mutate({
        staff_key: selectedStaff,
        service_key: selectedService,
        selected_date: formattedDate,
        slot_limit: 20
      }, {
        onSuccess: (response) => {
          setAvailableSlots(response.data.slots || []);
          setSelectedTimeSlot(""); // Reset selected time slot
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to fetch available time slots",
            variant: "destructive"
          });
        }
      });
    }
  }, [selectedService, selectedStaff, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !selectedService || !selectedStaff || !selectedDate || !selectedTimeSlot) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const selectedServiceData = services.find(s => s.key === selectedService);
    const selectedStaffData = staff.find(s => s.key === selectedStaff);

    if (!selectedServiceData || !selectedStaffData) {
      toast({
        title: "Error",
        description: "Invalid service or staff selection",
        variant: "destructive"
      });
      return;
    }

    // Parse the selected date and time
    const appointmentDateTime = new Date(`${selectedDate}T${selectedTimeSlot}`);
    const endDateTime = addMinutes(appointmentDateTime, selectedServiceData.duration);

    try {
      await createAppointmentMutation.mutateAsync({
        patientId: selectedPatient,
        appointmentDate: appointmentDateTime.toISOString(),
        duration: selectedServiceData.duration,
        description: description.trim() || undefined,
        serviceKey: selectedService,
        serviceName: selectedServiceData.service_name,
        staffKey: selectedStaff,
        staffName: `${selectedStaffData.first_name} ${selectedStaffData.last_name}`,
        cost: selectedServiceData.cost,
        currency: selectedServiceData.currency,
        status: "scheduled"
      });

      toast({
        title: "Success",
        description: "Appointment booked successfully",
      });

      // Reset form and close
      setSelectedPatient(patientId || 0);
      setSelectedService("");
      setSelectedStaff("");
      setSelectedDate(preselectedDate || "");
      setSelectedTimeSlot("");
      setDescription("");
      setAvailableSlots([]);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive"
      });
    }
  };

  const selectedServiceData = services.find(s => s.key === selectedService);
  const selectedStaffData = staff.find(s => s.key === selectedStaff);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            {patientName ? `Schedule a new appointment for ${patientName}` : "Schedule a new appointment"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection - only show if no patient is pre-selected */}
          {!patientId && (
            <div>
              <Label htmlFor="patient">Patient *</Label>
              <Select value={selectedPatient.toString()} onValueChange={(value) => setSelectedPatient(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{patient.firstName} {patient.lastName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Service Selection */}
          <div>
            <Label htmlFor="service">Service *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.key} value={service.key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{service.service_name}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline">{service.duration}min</Badge>
                        <Badge variant="secondary">€{(service.cost / 100).toFixed(2)}</Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedServiceData && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedServiceData.description}
              </p>
            )}
          </div>

          {/* Staff Selection */}
          <div>
            <Label htmlFor="staff">Healthcare Provider *</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select healthcare provider" />
              </SelectTrigger>
              <SelectContent>
                {staff
                  .filter(member => 
                    !selectedService || 
                    services.find(s => s.key === selectedService)?.staff_keys.includes(member.key)
                  )
                  .map((member) => (
                    <SelectItem key={member.key} value={member.key}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{member.first_name} {member.last_name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedStaffData && selectedStaffData.comment && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedStaffData.comment}
              </p>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              required
            />
          </div>

          {/* Time Slot Selection */}
          {selectedService && selectedStaff && selectedDate && (
            <div>
              <Label>Available Time Slots *</Label>
              {getSlotsMutation.isPending ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading available slots...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.slot_time}
                      type="button"
                      variant={selectedTimeSlot === slot.slot_time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeSlot(slot.slot_time)}
                      className="justify-start"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {slot.slot_time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No available slots for the selected date
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional notes for the appointment..."
              rows={3}
            />
          </div>

          {/* Appointment Summary */}
          {selectedServiceData && selectedStaffData && selectedDate && selectedTimeSlot && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Appointment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  <span>{selectedServiceData.service_name}</span>
                  <Badge variant="outline">{selectedServiceData.duration} min</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{selectedStaffData.first_name} {selectedStaffData.last_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedTimeSlot}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium">Total Cost:</span>
                  <Badge variant="secondary">€{(selectedServiceData.cost / 100).toFixed(2)}</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createAppointmentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createAppointmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Book Appointment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}