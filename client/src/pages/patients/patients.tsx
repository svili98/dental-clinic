import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { PatientSearch } from "@/components/patients/patient-search";
import { PatientTable } from "@/components/patients/patient-table";
import { PatientStats } from "@/components/patients/patient-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { usePatients } from "@/hooks/use-patients";
import { Link } from "wouter";
import { Plus, Download, Users, Filter, Grid3X3, List, FileSpreadsheet } from "lucide-react";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = useState("all");

  const { data: patientsData, isLoading } = usePatients({
    search: searchTerm,
    pageNumber: currentPage,
    pageSize,
  });

  const totalPages = patientsData?.totalPages || 1;
  const patients = patientsData?.items || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Patient Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage patient records, appointments, and medical history</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/patients/create">
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-patient">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <PatientStats patients={patients} />

        {/* Main Content */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <CardTitle>Patients</CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {patientsData?.totalCount || 0}
                  </Badge>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All Patients</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  data-testid="button-view-list"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-view-grid"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6">
              <PatientSearch
                onSearchChange={handleSearchChange}
                onPageSizeChange={handlePageSizeChange}
                totalCount={patientsData?.totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="all" className="m-0">
                <div className="px-6 pb-6">
                  <PatientTable 
                    patients={patients}
                    loading={isLoading}
                    compact={viewMode === "grid"}
                  />
                </div>
              </TabsContent>
              <TabsContent value="active" className="m-0">
                <div className="px-6 pb-6">
                  <PatientTable 
                    patients={patients.filter(p => {
                      // Filter active patients - simple logic based on recent activity
                      const daysSinceLastVisit = (new Date().getTime() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
                      return daysSinceLastVisit <= 180;
                    })}
                    loading={isLoading}
                    compact={viewMode === "grid"}
                  />
                </div>
              </TabsContent>
              <TabsContent value="inactive" className="m-0">
                <div className="px-6 pb-6">
                  <PatientTable 
                    patients={patients.filter(p => {
                      const daysSinceLastVisit = (new Date().getTime() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
                      return daysSinceLastVisit > 180;
                    })}
                    loading={isLoading}
                    compact={viewMode === "grid"}
                  />
                </div>
              </TabsContent>
              <TabsContent value="recent" className="m-0">
                <div className="px-6 pb-6">
                  <PatientTable 
                    patients={patients.filter(p => {
                      const daysSinceCreated = (new Date().getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                      return daysSinceCreated <= 30;
                    })}
                    loading={isLoading}
                    compact={viewMode === "grid"}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t bg-gray-50/50">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, patientsData?.totalCount || 0)} of {patientsData?.totalCount || 0} patients
                  </span>
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
