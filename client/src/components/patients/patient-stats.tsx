import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, FileText, DollarSign } from "lucide-react";
import type { DashboardStats } from "@shared/schema";

export function PatientStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-hover">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      title: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      change: "+12% from last month",
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-500"
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      change: "5 pending",
      icon: Calendar,
      bgColor: "bg-green-100",
      iconColor: "text-green-500"
    },
    {
      title: "Files Uploaded",
      value: stats.filesUploaded.toLocaleString(),
      change: "+8% from last week",
      icon: FileText,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-500"
    },
    {
      title: "Revenue (Month)",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      change: "+15% from last month",
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{item.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-sm text-green-500">{item.change}</p>
                </div>
                <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${item.iconColor} h-6 w-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
