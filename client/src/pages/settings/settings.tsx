import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, DollarSign, Users, Shield, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const [showRevenue, setShowRevenue] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true); // Mock admin status
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // Mock save settings
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-500">Manage your clinic management preferences</p>
          </div>
        </div>

        {/* User Role Badge */}
        <div className="flex items-center space-x-2">
          <Badge className={`px-3 py-1 ${isAdmin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            <Shield className="h-3 w-3 mr-1" />
            {isAdmin ? 'Administrator' : 'Staff Member'}
          </Badge>
        </div>

        <Separator />

        {/* Revenue Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Financial Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Show Revenue Data</Label>
                <p className="text-sm text-gray-500">
                  Control who can view financial information including patient payments and clinic revenue
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {showRevenue ? (
                  <Eye className="h-4 w-4 text-green-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                <Switch
                  checked={showRevenue}
                  onCheckedChange={setShowRevenue}
                  disabled={!isAdmin}
                />
              </div>
            </div>

            {!isAdmin && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <Shield className="h-4 w-4 inline mr-2" />
                  Administrator privileges required to modify financial settings
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Revenue Visibility Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Dashboard Statistics</span>
                    <Switch checked={showRevenue} disabled={!isAdmin} />
                  </div>
                  <p className="text-xs text-gray-500">Show monthly revenue on main dashboard</p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Patient Financial Details</span>
                    <Switch checked={showRevenue} disabled={!isAdmin} />
                  </div>
                  <p className="text-xs text-gray-500">Show payment history and outstanding balances</p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Appointment Fees</span>
                    <Switch checked={showRevenue} disabled={!isAdmin} />
                  </div>
                  <p className="text-xs text-gray-500">Display treatment costs in appointment history</p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Financial Reports</span>
                    <Switch checked={showRevenue} disabled={!isAdmin} />
                  </div>
                  <p className="text-xs text-gray-500">Access to revenue reports and analytics</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Access Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Input 
                  id="role" 
                  value={isAdmin ? "Administrator" : "Staff Member"} 
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Contact system administrator to change user roles</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="permissions">Permission Level</Label>
                <Input 
                  id="permissions" 
                  value={isAdmin ? "Full Access" : "Limited Access"} 
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Permissions are based on assigned role</p>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Administrator Features</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Manage financial settings and revenue visibility</li>
                  <li>• Access all patient records and financial data</li>
                  <li>• Configure system settings and user permissions</li>
                  <li>• Generate comprehensive reports and analytics</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
            Save Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
}