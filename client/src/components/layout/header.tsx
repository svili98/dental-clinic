import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Plus, Menu } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs"
            >
              3
            </Badge>
          </Button>
          
          {/* New Patient Button */}
          <Link href="/patients/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Patient
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
