import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Folder, MoreVertical } from "lucide-react";
import { Link } from "wouter";
import type { Patient } from "@shared/schema";
import { format } from "date-fns";

interface PatientTableProps {
  patients: Patient[];
  loading?: boolean;
}

export function PatientTable({ patients, loading }: PatientTableProps) {
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedPatients.length === patients.length && patients.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Last Visit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id} className="table-row-hover">
              <TableCell>
                <Checkbox
                  checked={selectedPatients.includes(patient.id)}
                  onCheckedChange={() => toggleSelectPatient(patient.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">👤</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: #{patient.id} • JMBG: {patient.jmbg}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-900">{patient.phone}</div>
                <div className="text-sm text-gray-500">{patient.email || 'No email'}</div>
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {format(new Date(patient.updatedAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <Badge className="status-badge status-active">Active</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Link href={`/patients/${patient.id}`}>
                    <Button variant="ghost" size="sm" title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/patients/${patient.id}/edit`}>
                    <Button variant="ghost" size="sm" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" title="Files">
                    <Folder className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="More">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {patients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No patients found. Try adjusting your search criteria.
        </div>
      )}
    </div>
  );
}
