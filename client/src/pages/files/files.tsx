import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { FileUpload } from "@/components/files/file-upload";
import { FileList } from "@/components/files/file-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { usePatients } from "@/hooks/use-patients";

export default function FilesPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>();
  const { data: patientsData } = usePatients({ pageSize: 100 });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Patient File Management</CardTitle>
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

        {/* File Upload */}
        <FileUpload patientId={selectedPatientId} />

        {/* File List */}
        <FileList patientId={selectedPatientId} />
      </div>
    </Layout>
  );
}
