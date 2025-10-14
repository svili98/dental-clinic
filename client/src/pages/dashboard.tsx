import { Layout } from "@/components/layout/layout";
import { PatientStats } from "@/components/patients/patient-stats";
import { PatientTable } from "@/components/patients/patient-table";
import { AppointmentList } from "@/components/appointments/appointment-list";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePatients } from "@/hooks/use-patients";
import { Link } from "wouter";
import { Plus, Download } from "lucide-react";

export default function Dashboard() {
  const { data: patientsData, isLoading } = usePatients({ pageSize: 5 });

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Stats Cards */}
        <PatientStats patients={patientsData?.items || []} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Patients */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Patients</CardTitle>
                  <div className="flex space-x-3">
                    <Link href="/patients/create">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Patient
                      </Button>
                    </Link>
                    <Link href="/patients">
                      <Button variant="outline">
                        View All
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PatientTable 
                  patients={patientsData?.items || []} 
                  loading={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Today's Appointments */}
          <div>
            <AppointmentList />
          </div>
        </div>


      </div>
    </Layout>
  );
}
