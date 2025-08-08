import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Plus, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useTranslation } from "@/lib/i18n";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLocation(`/patients?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
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
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t.search + ' ' + t.patients.toLowerCase() + '...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </form>
          
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
          
          {/* Language Toggle */}
          <LanguageToggle />
          
          {/* Theme Toggle */}
          <ModeToggle />
          
          {/* New Patient Button */}
          <Link href="/patients/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {t.add + ' ' + t.patients.slice(0, -1)}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
