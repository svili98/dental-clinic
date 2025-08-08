import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for development
const mockRoles = [
  {
    id: 1,
    name: "Administrator",
    description: "Full system access and user management",
    permissions: {
      patients: { read: true, write: true, delete: true },
      appointments: { read: true, write: true, delete: true },
      files: { read: true, write: true, delete: true },
      employees: { read: true, write: true, delete: true },
      settings: { read: true, write: true, delete: true }
    }
  },
  {
    id: 2,
    name: "Dentist",
    description: "Patient care and treatment management",
    permissions: {
      patients: { read: true, write: true, delete: false },
      appointments: { read: true, write: true, delete: false },
      files: { read: true, write: true, delete: false },
      employees: { read: true, write: false, delete: false },
      settings: { read: true, write: false, delete: false }
    }
  },
  {
    id: 3,
    name: "Dental Assistant",
    description: "Assist with patient care and basic operations",
    permissions: {
      patients: { read: true, write: false, delete: false },
      appointments: { read: true, write: true, delete: false },
      files: { read: true, write: false, delete: false },
      employees: { read: false, write: false, delete: false },
      settings: { read: false, write: false, delete: false }
    }
  },
  {
    id: 4,
    name: "Receptionist",
    description: "Front desk operations and appointment scheduling",
    permissions: {
      patients: { read: true, write: true, delete: false },
      appointments: { read: true, write: true, delete: false },
      files: { read: true, write: false, delete: false },
      employees: { read: false, write: false, delete: false },
      settings: { read: false, write: false, delete: false }
    }
  }
];

const mockEmployees = [
  {
    id: 1,
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@dentalcare.com",
    phone: "+1234567890",
    position: "Lead Dentist",
    department: "Clinical",
    roleId: 2,
    isActive: true,
    startDate: "2020-01-15",
    profileImageUrl: null,
    notes: "Specialist in endodontics and oral surgery"
  },
  {
    id: 2,
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@dentalcare.com",
    phone: "+1234567891",
    position: "Practice Manager",
    department: "Administration",
    roleId: 1,
    isActive: true,
    startDate: "2019-03-01",
    profileImageUrl: null,
    notes: "Oversees daily operations and staff management"
  },
  {
    id: 3,
    firstName: "Lisa",
    lastName: "Rodriguez",
    email: "lisa.rodriguez@dentalcare.com",
    phone: "+1234567892",
    position: "Dental Hygienist",
    department: "Clinical",
    roleId: 3,
    isActive: true,
    startDate: "2021-06-10",
    profileImageUrl: null,
    notes: "Specializes in preventive care and patient education"
  },
  {
    id: 4,
    firstName: "Emma",
    lastName: "Wilson",
    email: "emma.wilson@dentalcare.com",
    phone: "+1234567893",
    position: "Front Desk Coordinator",
    department: "Administration",
    roleId: 4,
    isActive: false,
    startDate: "2022-09-05",
    profileImageUrl: null,
    notes: "On maternity leave"
  }
];

export function EmployeeManagement() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [roles, setRoles] = useState(mockRoles);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const { toast } = useToast();

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || employee.roleId.toString() === filterRole;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" ? employee.isActive : !employee.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleName = (roleId: number) => {
    return roles.find(role => role.id === roleId)?.name || "Unknown";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleToggleEmployeeStatus = (employeeId: number, newStatus: boolean) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, isActive: newStatus } : emp
    ));
    
    toast({
      title: "Employee Status Updated",
      description: `Employee has been ${newStatus ? 'activated' : 'deactivated'}.`,
    });
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEditEmployeeModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">
            Manage staff members and their access permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsRoleModalOpen(true)}
          >
            <Shield className="h-4 w-4 mr-2" />
            Manage Roles
          </Button>
          <Button 
            onClick={() => setIsAddEmployeeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setFilterRole("all");
                  setFilterStatus("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">{employees.filter(e => !e.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={employee.profileImageUrl} />
                    <AvatarFallback>
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <Badge variant={employee.isActive ? "default" : "secondary"}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {employee.position} • {employee.department}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {employee.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {getRoleName(employee.roleId)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={employee.isActive}
                    onCheckedChange={(checked) => handleToggleEmployeeStatus(employee.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEmployee(employee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredEmployees.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No employees found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or add a new employee.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      <Dialog open={isAddEmployeeModalOpen} onOpenChange={setIsAddEmployeeModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account with role-based permissions.
            </DialogDescription>
          </DialogHeader>
          {/* Add employee form would go here */}
          <div className="text-center py-8 text-muted-foreground">
            Employee creation form will be implemented here
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog open={isEditEmployeeModalOpen} onOpenChange={setIsEditEmployeeModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information and permissions.
            </DialogDescription>
          </DialogHeader>
          {/* Edit employee form would go here */}
          <div className="text-center py-8 text-muted-foreground">
            Employee editing form will be implemented here
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Management Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Roles & Permissions</DialogTitle>
            <DialogDescription>
              Configure user roles and their system permissions.
            </DialogDescription>
          </DialogHeader>
          {/* Role management interface would go here */}
          <div className="text-center py-8 text-muted-foreground">
            Role management interface will be implemented here
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}