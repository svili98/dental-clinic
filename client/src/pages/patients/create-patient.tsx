import { Layout } from "@/components/layout/layout";
import { PatientForm } from "@/components/patients/patient-form";
import { useCreatePatient, useUpdatePatient, usePatient } from "@/hooks/use-patients";
import { useCreatePatientFile } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { InsertPatient } from "@shared/schema";

export default function CreatePatientPage() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const createFileMutation = useCreatePatientFile();
  const { toast } = useToast();

  // Fetch patient data if in edit mode
  const { data: patient, isLoading: isLoadingPatient } = usePatient(
    isEditMode ? parseInt(id!) : undefined
  );

  const handleSubmit = async (data: InsertPatient, files?: File[]) => {
    try {
      if (isEditMode && patient) {
        await updatePatientMutation.mutateAsync({ 
          id: patient.id, 
          patient: data 
        });
        
        // Upload files if any
        if (files && files.length > 0) {
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('patientId', patient.id.toString());
            formData.append('category', 'document');
            formData.append('description', `Patient document: ${file.name}`);

            try {
              await fetch('/api/files', {
                method: 'POST',
                body: formData,
              });
            } catch (fileError) {
              console.error('Failed to upload file:', file.name, fileError);
            }
          }
        }
        
        toast({
          title: "Success",
          description: "Patient updated successfully",
        });
        setLocation(`/patients/${patient.id}`);
      } else {
        const newPatient = await createPatientMutation.mutateAsync(data);
        
        // Upload files if any
        if (files && files.length > 0) {
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('patientId', newPatient.id.toString());
            formData.append('category', 'document');
            formData.append('description', `Patient document: ${file.name}`);

            try {
              await fetch('/api/files', {
                method: 'POST',
                body: formData,
              });
            } catch (fileError) {
              console.error('Failed to upload file:', file.name, fileError);
            }
          }
        }
        
        toast({
          title: "Success",
          description: "Patient created successfully",
        });
        setLocation(`/patients/${newPatient.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update patient" : "Failed to create patient",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocation(isEditMode ? `/patients/${id}` : "/patients");
  };

  if (isEditMode && isLoadingPatient) {
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading patient data...
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isEditMode && !patient) {
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">Patient not found</p>
              <Link href="/patients">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Patients
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {isEditMode ? "Edit Patient" : "Add New Patient"}
              </CardTitle>
              <Link href={isEditMode ? `/patients/${id}` : "/patients"}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <PatientForm
              initialData={isEditMode ? patient : undefined}
              onSubmit={handleSubmit}
              loading={createPatientMutation.isPending || updatePatientMutation.isPending}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
