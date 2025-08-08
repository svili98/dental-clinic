import { Layout } from "@/components/layout/layout";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AppointmentsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Manage and schedule patient appointments
          </p>
        </div>
        
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-6">
            <AppointmentCalendar />
          </TabsContent>
          
          <TabsContent value="list" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AppointmentList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}