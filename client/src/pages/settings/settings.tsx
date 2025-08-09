import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, DollarSign, Users, Shield, Eye, EyeOff, UserCog } from "lucide-react";
import { EmployeeManagement } from "@/components/settings/employee-management";
import { RoleManagement } from "@/components/settings/role-management";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { employee } = useAuth();
  const { settings, updateSettings, isLoading, isUpdating } = useSettings();
  const [showRevenue, setShowRevenue] = useState(false);
  const { toast } = useToast();

  // Initialize local state with settings
  useEffect(() => {
    if (settings) {
      setShowRevenue(settings.showRevenue);
    }
  }, [settings]);

  const isAdmin = employee?.roleId === 1; // Admin role ID is 1

  const handleSaveSettings = () => {
    updateSettings({ showRevenue });
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-gray-500">Manage your clinic management preferences</p>
            </div>
          </div>
          <Badge className={`px-3 py-1 ${isAdmin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            <Shield className="h-3 w-3 mr-1" />
            {isAdmin ? 'Administrator' : 'Staff Member'}
          </Badge>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General Settings
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Employee Management
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 mt-6">
            {/* Revenue Visibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financial Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="revenue-visibility" className="text-sm font-medium">
                      Show Revenue Data
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Display financial information in dashboard and reports
                    </p>
                  </div>
                  <Switch
                    id="revenue-visibility"
                    checked={showRevenue}
                    onCheckedChange={setShowRevenue}
                  />
                </div>
                {showRevenue ? (
                  <div className="flex items-center text-sm text-green-600">
                    <Eye className="h-4 w-4 mr-1" />
                    Revenue data is visible
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-gray-500">
                    <EyeOff className="h-4 w-4 mr-1" />
                    Revenue data is hidden
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
                Save Settings
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="employees" className="space-y-6 mt-6">
            <EmployeeManagement />
          </TabsContent>
          
          <TabsContent value="permissions" className="space-y-6 mt-6">
            <RoleManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}