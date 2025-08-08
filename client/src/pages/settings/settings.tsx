import { useState } from "react";
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

export default function SettingsPage() {
  const [showRevenue, setShowRevenue] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true); // Mock admin status
  const { toast } = useToast();

  const handleSaveSettings = () => {
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
            {/* Role-Based Access Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Role-Based Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  Configure permissions and access levels for different user roles:
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Administrator</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Full system access</li>
                      <li>• User management</li>
                      <li>• Financial reports</li>
                      <li>• System settings</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Dentist</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Patient management</li>
                      <li>• Treatment planning</li>
                      <li>• Medical records</li>
                      <li>• Appointment management</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Dental Assistant</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• View patient records</li>
                      <li>• Schedule appointments</li>
                      <li>• Upload files</li>
                      <li>• Basic reporting</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Receptionist</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Basic patient info</li>
                      <li>• Appointment scheduling</li>
                      <li>• File management</li>
                      <li>• Front desk operations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permission Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Feature</th>
                        <th className="text-center py-2">Admin</th>
                        <th className="text-center py-2">Dentist</th>
                        <th className="text-center py-2">Assistant</th>
                        <th className="text-center py-2">Receptionist</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Patient Management</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">View Only</td>
                        <td className="text-center">✓</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Appointments</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">✓</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Medical Records</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">View Only</td>
                        <td className="text-center">✗</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Financial Reports</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">View Only</td>
                        <td className="text-center">✗</td>
                        <td className="text-center">✗</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Employee Management</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">✗</td>
                        <td className="text-center">✗</td>
                        <td className="text-center">✗</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Odontogram</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">✓</td>
                        <td className="text-center">View Only</td>
                        <td className="text-center">✗</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}