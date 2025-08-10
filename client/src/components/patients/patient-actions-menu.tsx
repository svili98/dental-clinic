import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Edit, Folder, MoreVertical, Calendar, FileText, Trash2, Phone, Mail } from "lucide-react";
import { Link } from "wouter";
import { useDeletePatient } from "@/hooks/use-patients";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@shared/schema";

interface PatientActionsMenuProps {
  patient: Patient;
}

export function PatientActionsMenu({ patient }: PatientActionsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deletePatientMutation = useDeletePatient();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deletePatientMutation.mutateAsync(patient.id);
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  const handleCall = () => {
    window.open(`tel:${patient.phone}`, '_self');
  };

  const handleEmail = () => {
    if (patient.email) {
      window.open(`mailto:${patient.email}`, '_self');
    }
  };

  return (
    <>
      <div className="flex items-center justify-end space-x-1">
        {/* Quick action buttons */}
        <Link href={`/patients/${patient.id}`}>
          <Button variant="ghost" size="sm" title="View Details" data-testid={`button-view-${patient.id}`}>
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/patients/${patient.id}/edit`}>
          <Button variant="ghost" size="sm" title="Edit Patient" data-testid={`button-edit-${patient.id}`}>
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/files?patientId=${patient.id}`}>
          <Button variant="ghost" size="sm" title="Patient Files" data-testid={`button-files-${patient.id}`}>
            <Folder className="h-4 w-4" />
          </Button>
        </Link>
        
        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" title="More Actions" data-testid={`button-more-${patient.id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCall} disabled={!patient.phone}>
              <Phone className="h-4 w-4 mr-2" />
              Call Patient
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEmail} disabled={!patient.email}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/appointments?patientId=${patient.id}`}>
              <DropdownMenuItem>
                <Calendar className="h-4 w-4 mr-2" />
                View Appointments
              </DropdownMenuItem>
            </Link>
            <Link href={`/medical-records?patientId=${patient.id}`}>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Medical Records
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Patient
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {patient.firstName} {patient.lastName}? 
              This action cannot be undone and will remove all associated data including 
              appointments, medical records, and files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deletePatientMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePatientMutation.isPending}
            >
              {deletePatientMutation.isPending ? "Deleting..." : "Delete Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}