import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Calendar, Activity, TrendingUp } from "lucide-react";
import type { Patient } from "@shared/schema";
import { differenceInYears, parseISO } from "date-fns";
import { useTranslation } from "@/lib/i18n";

interface PatientStatsProps {
  patients?: Patient[];
}

export function PatientStats({ patients }: PatientStatsProps) {
  const { t } = useTranslation();
  const safePatients = patients || [];
  const totalPatients = safePatients.length;
  
  const activePatients = safePatients.filter(p => {
    const daysSinceLastVisit = (new Date().getTime() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastVisit <= 180;
  }).length;

  const inactivePatients = totalPatients - activePatients;

  const newPatientsThisMonth = safePatients.filter(p => {
    const daysSinceCreated = (new Date().getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 30;
  }).length;

  const averageAge = safePatients.length > 0 ? Math.round(
    safePatients.reduce((sum, p) => {
      try {
        return sum + differenceInYears(new Date(), parseISO(p.dateOfBirth));
      } catch {
        return sum;
      }
    }, 0) / safePatients.length
  ) : 0;

  const ageDistribution = {
    children: safePatients.filter(p => {
      try {
        const age = differenceInYears(new Date(), parseISO(p.dateOfBirth));
        return age < 18;
      } catch {
        return false;
      }
    }).length,
    adults: safePatients.filter(p => {
      try {
        const age = differenceInYears(new Date(), parseISO(p.dateOfBirth));
        return age >= 18 && age < 65;
      } catch {
        return false;
      }
    }).length,
    seniors: safePatients.filter(p => {
      try {
        const age = differenceInYears(new Date(), parseISO(p.dateOfBirth));
        return age >= 65;
      } catch {
        return false;
      }
    }).length,
  };

  const stats = [
    {
      title: t.totalPatients,
      value: totalPatients.toString(),
      description: "All registered patients",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      badge: null,
    },
    {
      title: t.activePatients,
      value: activePatients.toString(),
      description: "Visited within 6 months",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      badge: totalPatients > 0 ? `${Math.round((activePatients / totalPatients) * 100)}%` : "0%",
    },
    {
      title: t.inactivePatients,
      value: inactivePatients.toString(),
      description: "No recent visits",
      icon: UserX,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      badge: totalPatients > 0 ? `${Math.round((inactivePatients / totalPatients) * 100)}%` : "0%",
    },
    {
      title: t.newPatientsThisMonth,
      value: newPatientsThisMonth.toString(),
      description: "Recently registered",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      badge: newPatientsThisMonth > 0 ? "New" : null,
    },
    {
      title: t.averageAge,
      value: `${averageAge} years`,
      description: "Patient demographics",
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      badge: null,
    },
    {
      title: t.ageDistribution,
      value: `${ageDistribution.children}/${ageDistribution.adults}/${ageDistribution.seniors}`,
      description: `${t.children}/${t.adults}/${t.seniors}`,
      icon: Activity,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      badge: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                {stat.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {stat.badge}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}