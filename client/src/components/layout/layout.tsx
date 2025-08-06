import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

const getPageTitle = (pathname: string): string => {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/patients")) return "Patients";
  if (pathname.startsWith("/appointments")) return "Appointments";
  if (pathname.startsWith("/files")) return "Files & Documents";
  if (pathname.startsWith("/settings")) return "Settings";
  return "DentalCare";
};

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [location] = useLocation();

  const pageTitle = getPageTitle(location);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onCollapse={setSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={pageTitle}
        />
        
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
