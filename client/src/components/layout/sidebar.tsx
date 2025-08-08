import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Folder, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope
} from "lucide-react";


interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useTranslation();

  const navigationItems = [
    { name: t.dashboard, href: "/", icon: Home },
    { name: t.patients, href: "/patients", icon: Users },
    { name: t.appointments, href: "/appointments", icon: Calendar },
    { name: "Services", href: "/services", icon: Stethoscope },
    { name: t.medicalRecords, href: "/medical-records", icon: FileText },
    { name: t.filesDocuments, href: "/files", icon: Folder },
    { name: t.settings, href: "/settings", icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "bg-card border-r border-border flex-shrink-0 sidebar-transition",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 medical-primary-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🦷</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-foreground">DentalCare</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/20",
                    collapsed && "px-2"
                  )}
                >
                  <Icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-3")} />
                  {!collapsed && item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapse(!collapsed)}
            className="w-full justify-center"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Profile */}
        {!collapsed && (
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👨‍⚕️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Dr. Sarah Johnson</p>
                <p className="text-xs text-muted-foreground truncate">Dentist</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
