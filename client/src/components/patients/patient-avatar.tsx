import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface PatientAvatarProps {
  patient: {
    firstName: string;
    lastName: string;
    profilePicture?: string | null;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-12 w-12",
  xl: "h-16 w-16"
};

export function PatientAvatar({ patient, size = "md", className = "" }: PatientAvatarProps) {
  const initials = `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase();
  
  return (
    <Avatar className={`${sizeMap[size]} ${className}`}>
      {patient.profilePicture ? (
        <AvatarImage 
          src={patient.profilePicture} 
          alt={`${patient.firstName} ${patient.lastName}`}
        />
      ) : null}
      <AvatarFallback className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}