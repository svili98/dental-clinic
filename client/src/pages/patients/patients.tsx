import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { PatientSearch } from "@/components/patients/patient-search";
import { PatientTable } from "@/components/patients/patient-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { usePatients } from "@/hooks/use-patients";
import { Link } from "wouter";
import { Plus, Download } from "lucide-react";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: patientsData, isLoading } = usePatients({
    search: searchTerm,
    pageNumber: currentPage,
    pageSize,
  });

  const totalPages = patientsData?.totalPages || 1;

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
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Patient Management</CardTitle>
              <div className="flex space-x-3">
                <Link href="/patients/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                </Link>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PatientSearch
              onSearchChange={handleSearchChange}
              onPageSizeChange={handlePageSizeChange}
              totalCount={patientsData?.totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
            />

            <PatientTable 
              patients={patientsData?.items || []} 
              loading={isLoading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
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
