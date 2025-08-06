import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Folder, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Medical Records", href: "/medical-records", icon: FileText },
  { name: "Files & Documents", href: "/files", icon: Folder },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside 
      className={cn(
        "medical-sidebar border-r border-gray-200 flex-shrink-0 sidebar-transition",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 medical-primary-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🦷</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-gray-900">DentalCare</span>
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
                    isActive && "bg-blue-50 text-blue-600 hover:bg-blue-100",
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
        <div className="border-t border-gray-200 p-4">
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
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👨‍⚕️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Dr. Sarah Johnson</p>
                <p className="text-xs text-gray-500 truncate">Dentist</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
