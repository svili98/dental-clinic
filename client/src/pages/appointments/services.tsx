import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Euro, Users, Stethoscope } from "lucide-react";
import { useSetmoreServices, useSetmoreStaff } from "@/hooks/use-setmore";

export default function ServicesPage() {
  const { data: servicesData, isLoading: servicesLoading } = useSetmoreServices();
  const { data: staffData, isLoading: staffLoading } = useSetmoreStaff();

  const services = servicesData?.data?.services || [];
  const staff = staffData?.data?.staffs || [];

  // Create a map of staff keys to names for display
  const staffMap = new Map();
  staff.forEach(member => {
    staffMap.set(member.key, `${member.first_name} ${member.last_name}`);
  });

  if (servicesLoading || staffLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-muted-foreground">
              Manage dental services and treatment options
            </p>
          </div>
          
          <div className="grid gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-muted-foreground">
              Dental services available for appointment booking
            </p>
          </div>
          <Badge variant="secondary">
            {services.length} Services Available
          </Badge>
        </div>

        <div className="grid gap-6">
          {services.map((service) => (
            <Card key={service.key} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    {service.service_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {service.duration} min
                    </Badge>
                    {service.buffer_duration && (
                      <Badge variant="outline">
                        +{service.buffer_duration} buffer
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      <Euro className="h-3 w-3 mr-1" />
                      {(service.cost / 100).toFixed(2)}
                    </Badge>
                  </div>
                </div>
                {service.description && (
                  <p className="text-muted-foreground text-sm">
                    {service.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Available Staff */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Available Providers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.staff_keys.map((staffKey) => (
                        <Badge key={staffKey} variant="outline">
                          {staffMap.get(staffKey) || staffKey}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg font-semibold">{service.duration} min</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Cost</p>
                      <p className="text-lg font-semibold">€{(service.cost / 100).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Providers</p>
                      <p className="text-lg font-semibold">{service.staff_keys.length}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      Book This Service
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && !servicesLoading && (
          <Card>
            <CardContent className="text-center py-8">
              <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Services Available</h3>
              <p className="text-muted-foreground">
                Services will appear here when they are configured in Setmore
              </p>
            </CardContent>
          </Card>
        )}

        {/* Staff Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Healthcare Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map((member) => (
                <div key={member.key} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{member.first_name} {member.last_name}</h4>
                    {member.comment && (
                      <p className="text-sm text-muted-foreground">{member.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}