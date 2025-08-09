import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Shield, Users, Settings, Eye, Save, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Role, Employee, InsertRole, InsertEmployee } from "@shared/schema";

// Permission categories and their specific permissions
const PERMISSION_CATEGORIES = {
  patients: {
    name: "Patient Management",
    icon: Users,
    permissions: [
      { key: "view_patients", name: "View Patients", description: "View patient information and records" },
      { key: "create_patients", name: "Create Patients", description: "Add new patients to the system" },
      { key: "edit_patients", name: "Edit Patients", description: "Modify patient information" },
      { key: "delete_patients", name: "Delete Patients", description: "Remove patients from the system" },
      { key: "view_medical_history", name: "View Medical History", description: "Access patient medical history" },
      { key: "edit_medical_history", name: "Edit Medical History", description: "Modify patient medical records" },
    ]
  },
  appointments: {
    name: "Appointments",
    icon: Settings,
    permissions: [
      { key: "view_appointments", name: "View Appointments", description: "View appointment schedule" },
      { key: "create_appointments", name: "Create Appointments", description: "Schedule new appointments" },
      { key: "edit_appointments", name: "Edit Appointments", description: "Modify appointment details" },
      { key: "cancel_appointments", name: "Cancel Appointments", description: "Cancel appointments" },
      { key: "view_calendar", name: "View Calendar", description: "Access calendar views" },
    ]
  },
  financial: {
    name: "Financial",
    icon: Eye,
    permissions: [
      { key: "view_payments", name: "View Payments", description: "View payment records" },
      { key: "record_payments", name: "Record Payments", description: "Add new payment records" },
      { key: "view_revenue", name: "View Revenue", description: "Access revenue reports" },
      { key: "view_financial_reports", name: "Financial Reports", description: "Generate financial reports" },
      { key: "manage_pricing", name: "Manage Pricing", description: "Set treatment prices" },
    ]
  },
  system: {
    name: "System Administration",
    icon: Shield,
    permissions: [
      { key: "manage_users", name: "Manage Users", description: "Add, edit, and remove system users" },
      { key: "manage_roles", name: "Manage Roles", description: "Create and modify user roles" },
      { key: "system_settings", name: "System Settings", description: "Access system configuration" },
      { key: "view_audit_logs", name: "View Audit Logs", description: "Access system audit trails" },
      { key: "backup_restore", name: "Backup & Restore", description: "Perform system backups" },
    ]
  },
  treatment: {
    name: "Treatment Management",
    icon: Settings,
    permissions: [
      { key: "view_odontogram", name: "View Odontogram", description: "View dental charts" },
      { key: "edit_odontogram", name: "Edit Odontogram", description: "Modify dental charts" },
      { key: "view_treatment_history", name: "View Treatment History", description: "Access treatment records" },
      { key: "create_treatment_plans", name: "Create Treatment Plans", description: "Develop treatment plans" },
      { key: "manage_prescriptions", name: "Manage Prescriptions", description: "Create and manage prescriptions" },
    ]
  },
  files: {
    name: "File Management",
    icon: Settings,
    permissions: [
      { key: "view_files", name: "View Files", description: "View patient files and documents" },
      { key: "upload_files", name: "Upload Files", description: "Upload new files and documents" },
      { key: "delete_files", name: "Delete Files", description: "Remove files from the system" },
      { key: "manage_file_categories", name: "Manage Categories", description: "Organize file categories" },
    ]
  }
};

const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required").max(100, "Role name must be less than 100 characters"),
  description: z.string().max(255, "Description must be less than 255 characters").optional(),
  permissions: z.record(z.string(), z.boolean()).default({}),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

export function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Utility functions
  const getPermissionCount = (permissions: Record<string, boolean>) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  const getTotalPermissions = () => {
    return Object.values(PERMISSION_CATEGORIES).reduce(
      (total, category) => total + category.permissions.length,
      0
    );
  };

  // Fetch roles
  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Role Created",
        description: "New role has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RoleFormData }) => {
      const response = await fetch(`/api/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: "Role Updated",
        description: "Role has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/roles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete role');
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: "Role Deleted",
        description: "Role has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateRole = (data: RoleFormData) => {
    createRoleMutation.mutate(data);
  };

  const handleUpdateRole = (data: RoleFormData) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, data });
    }
  };

  const handleDeleteRole = (id: number) => {
    deleteRoleMutation.mutate(id);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Role Management</h3>
          <p className="text-sm text-gray-600">
            Create and manage user roles with custom permissions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <RoleForm onSubmit={handleCreateRole} isLoading={createRoleMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  {role.description && (
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditRole(role)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the "{role.name}" role? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteRole(role.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Permissions</span>
                  <Badge variant="secondary">
                    {getPermissionCount(role.permissions as Record<string, boolean>)}/{getTotalPermissions()}
                  </Badge>
                </div>
                
                {/* Permission categories overview */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => {
                    const rolePerms = role.permissions as Record<string, boolean>;
                    const categoryPermissions = category.permissions.filter(
                      (permission) => rolePerms[permission.key]
                    ).length;
                    const totalCategoryPermissions = category.permissions.length;
                    
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-600">{category.name}</span>
                        <span className="font-medium">
                          {categoryPermissions}/{totalCategoryPermissions}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <RoleForm
              initialData={selectedRole}
              onSubmit={handleUpdateRole}
              isLoading={updateRoleMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface RoleFormProps {
  initialData?: Role;
  onSubmit: (data: RoleFormData) => void;
  isLoading: boolean;
}

function RoleForm({ initialData, onSubmit, isLoading }: RoleFormProps) {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      permissions: initialData?.permissions || {},
    },
  });

  const getTotalPermissions = () => {
    return Object.values(PERMISSION_CATEGORIES).reduce(
      (total, category) => total + category.permissions.length,
      0
    );
  };

  const handleSubmit = (data: RoleFormData) => {
    onSubmit(data);
  };

  const handlePermissionChange = (permissionKey: string, checked: boolean) => {
    const currentPermissions = form.getValues("permissions");
    form.setValue("permissions", {
      ...currentPermissions,
      [permissionKey]: checked,
    });
  };

  const handleSelectAllCategory = (categoryKey: string, checked: boolean) => {
    const category = PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES];
    const currentPermissions = form.getValues("permissions");
    const updatedPermissions = { ...currentPermissions };
    
    category.permissions.forEach(permission => {
      updatedPermissions[permission.key] = checked;
    });
    
    form.setValue("permissions", updatedPermissions);
  };

  const watchedPermissions = form.watch("permissions");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter role name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Optional description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Permissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">Permissions</h4>
            <div className="text-sm text-gray-600">
              {Object.values(watchedPermissions).filter(Boolean).length}/{getTotalPermissions()} permissions selected
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
              const categoryPermissions = category.permissions;
              const selectedInCategory = categoryPermissions.filter(
                (permission) => watchedPermissions[permission.key]
              ).length;
              const allSelected = selectedInCategory === categoryPermissions.length;
              const someSelected = selectedInCategory > 0 && selectedInCategory < categoryPermissions.length;

              return (
                <Card key={categoryKey}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <category.icon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base">{category.name}</CardTitle>
                        <Badge variant={someSelected ? "secondary" : allSelected ? "default" : "outline"}>
                          {selectedInCategory}/{categoryPermissions.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`select-all-${categoryKey}`} className="text-sm">
                          Select All
                        </Label>
                        <Switch
                          id={`select-all-${categoryKey}`}
                          checked={allSelected}
                          onCheckedChange={(checked) => handleSelectAllCategory(categoryKey, checked)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.key} className="flex items-center space-x-3">
                          <Switch
                            id={permission.key}
                            checked={watchedPermissions[permission.key] || false}
                            onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={permission.key}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                            <p className="text-xs text-gray-600">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </form>
    </Form>
  );
}