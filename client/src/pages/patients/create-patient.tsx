import { Layout } from "@/components/layout/layout";
import { PatientForm } from "@/components/patients/patient-form";
import { useCreatePatient } from "@/hooks/use-patients";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { InsertPatient } from "@shared/schema";

export default function CreatePatientPage() {
  const [, setLocation] = useLocation();
  const createPatientMutation = useCreatePatient();
  const { toast } = useToast();

  const handleSubmit = async (data: InsertPatient) => {
    try {
      const patient = await createPatientMutation.mutateAsync(data);
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
      setLocation(`/patients/${patient.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocation("/patients");
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <PatientForm
          onSubmit={handleSubmit}
          loading={createPatientMutation.isPending}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}
