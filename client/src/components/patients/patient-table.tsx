import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PatientActionsMenu } from "./patient-actions-menu";
import { Calendar, Phone, Mail, MapPin, Activity } from "lucide-react";
import { Link } from "wouter";
import type { Patient } from "@shared/schema";
import { PATIENT_STATUSES } from "@shared/schema";
import { format, parseISO, differenceInYears } from "date-fns";

interface PatientTableProps {
  patients: Patient[];
  loading?: boolean;
  compact?: boolean;
}

export function PatientTable({ patients, loading, compact = false }: PatientTableProps) {
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);

  const toggleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map(p => p.id));
    }
  };

  const toggleSelectPatient = (patientId: number) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const getPatientAge = (dateOfBirth: string) => {
    try {
      return differenceInYears(new Date(), parseISO(dateOfBirth));
    } catch {
      return 0;
    }
  };

  const getPatientStatus = (patient: Patient) => {
    const status = PATIENT_STATUSES[patient.statusId as keyof typeof PATIENT_STATUSES];
    if (!status) {
      return { status: "Unknown", variant: "secondary" as const, color: "gray" };
    }
    
    // Map colors to badge variants
    const variantMap = {
      green: "default" as const,
      gray: "secondary" as const,
      blue: "outline" as const,
      orange: "destructive" as const,
      purple: "outline" as const
    };
    
    return { 
      status: status.name, 
      variant: variantMap[status.color as keyof typeof variantMap] || "secondary" as const,
      color: status.color
    };
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/60">
            {!compact && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedPatients.length === patients.length && patients.length > 0}
                  onCheckedChange={toggleSelectAll}
                  data-testid="checkbox-select-all"
                />
              </TableHead>
            )}
            <TableHead>Patient</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Age & Birth Date</TableHead>
            <TableHead>Last Visit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {
            const age = getPatientAge(patient.dateOfBirth);
            const status = getPatientStatus(patient);
            const initials = `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();

            return (
              <TableRow 
                key={patient.id} 
                className="hover:bg-muted/30 transition-colors duration-200 group"
                data-testid={`row-patient-${patient.id}`}
              >
                {!compact && (
                  <TableCell>
                    <Checkbox
                      checked={selectedPatients.includes(patient.id)}
                      onCheckedChange={() => toggleSelectPatient(patient.id)}
                      data-testid={`checkbox-patient-${patient.id}`}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Link href={`/patients/${patient.id}`} className="block">
                    <div className="flex items-center space-x-3 group-hover:text-blue-600 transition-colors cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={patient.profilePicture || ""} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: #{patient.id}
                          {patient.jmbg && ` • JMBG: ${patient.jmbg}`}
                        </div>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      {patient.phone}
                    </div>
                    {patient.email && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-3 w-3 mr-2 text-gray-400" />
                        {patient.email}
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                        {patient.address}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">
                      {age} years old
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                      {format(parseISO(patient.dateOfBirth), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900 flex items-center">
                    <Activity className="h-3 w-3 mr-2 text-gray-400" />
                    {format(new Date(patient.updatedAt), 'MMM dd, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant} className="text-xs">
                    {status.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <PatientActionsMenu patient={patient} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {patients.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium mb-2">No patients found</p>
          <p className="text-sm">Try adjusting your search criteria or add a new patient.</p>
        </div>
      )}
    </div>
  );
}
