import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import PatientsPage from "@/pages/patients/patients";
import CreatePatientPage from "@/pages/patients/create-patient";
import PatientDetailsPage from "@/pages/patients/patient-details";
import AppointmentsPage from "@/pages/appointments/appointments";
import FilesPage from "@/pages/files/files";
import MedicalRecordsPage from "@/pages/medical-records/medical-records";
import SettingsPage from "@/pages/settings/settings";
import ServicesPage from "@/pages/appointments/services";
import LoginPage from "@/pages/login";

function Router() {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/patients" component={PatientsPage} />
      <Route path="/patients/create" component={CreatePatientPage} />
      <Route path="/patients/:id" component={PatientDetailsPage} />
      <Route path="/patients/:id/edit" component={CreatePatientPage} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/files" component={FilesPage} />
      <Route path="/medical-records" component={MedicalRecordsPage} />
      <Route path="/settings" component={SettingsPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
