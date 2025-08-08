import {
  SetmoreConfig,
  SetmoreService,
  SetmoreStaff,
  SetmoreCustomer,
  SetmoreTimeSlot,
  SetmoreAppointment,
  SetmoreSlotsRequest,
  SetmoreAppointmentRequest,
  SetmoreApiResponse,
  MockSetmoreData
} from "../../shared/setmore-types";

export class SetmoreApiService {
  private config: SetmoreConfig;
  private mockData: MockSetmoreData;

  constructor(config: SetmoreConfig) {
    this.config = config;
    this.mockData = this.initializeMockData();
  }

  private initializeMockData(): MockSetmoreData {
    return {
      services: [
        {
          key: "dental-cleaning",
          service_name: "Dental Cleaning",
          staff_keys: ["dr-smith", "dr-jones"],
          duration: 30,
          cost: 8000, // €80.00 in cents
          currency: "EUR",
          description: "Professional dental cleaning and oral hygiene"
        },
        {
          key: "dental-checkup",
          service_name: "Dental Checkup",
          staff_keys: ["dr-smith", "dr-jones"],
          duration: 20,
          cost: 5000, // €50.00 in cents
          currency: "EUR",
          description: "Routine dental examination and assessment"
        },
        {
          key: "tooth-filling",
          service_name: "Tooth Filling",
          staff_keys: ["dr-smith"],
          duration: 60,
          buffer_duration: 15,
          cost: 15000, // €150.00 in cents
          currency: "EUR",
          description: "Dental cavity filling treatment"
        },
        {
          key: "root-canal",
          service_name: "Root Canal Treatment",
          staff_keys: ["dr-smith"],
          duration: 90,
          buffer_duration: 30,
          cost: 35000, // €350.00 in cents
          currency: "EUR",
          description: "Endodontic root canal therapy"
        },
        {
          key: "crown-installation",
          service_name: "Crown Installation",
          staff_keys: ["dr-smith", "dr-jones"],
          duration: 45,
          buffer_duration: 15,
          cost: 50000, // €500.00 in cents
          currency: "EUR",
          description: "Dental crown placement and fitting"
        },
        {
          key: "teeth-whitening",
          service_name: "Teeth Whitening",
          staff_keys: ["dr-jones", "hyg-maria"],
          duration: 40,
          cost: 20000, // €200.00 in cents
          currency: "EUR",
          description: "Professional teeth whitening treatment"
        }
      ],
      staff: [
        {
          key: "dr-smith",
          first_name: "Dr. John",
          last_name: "Smith",
          email_id: "dr.smith@dentalcare.com",
          country_code: "+381",
          work_phone: "123456789",
          image_url: "",
          comment: "Lead dentist with 15+ years experience"
        },
        {
          key: "dr-jones",
          first_name: "Dr. Sarah",
          last_name: "Jones",
          email_id: "dr.jones@dentalcare.com",
          country_code: "+381",
          work_phone: "123456788",
          image_url: "",
          comment: "Specialist in cosmetic dentistry"
        },
        {
          key: "hyg-maria",
          first_name: "Maria",
          last_name: "Rodriguez",
          email_id: "maria@dentalcare.com",
          country_code: "+381",
          work_phone: "123456787",
          image_url: "",
          comment: "Certified dental hygienist"
        }
      ],
      customers: [],
      appointments: []
    };
  }

  // Token management (mocked for development)
  async getAccessToken(): Promise<string> {
    // In production, this would make a real API call to refresh the access token
    // For development, return a mock token
    return "mock_access_token_" + Date.now();
  }

  // Services
  async getAllServices(): Promise<SetmoreApiResponse<{ services: SetmoreService[] }>> {
    // For development - return mock data immediately
    // In production, uncomment the API call below and remove this mock return
    
    // PRODUCTION CODE (commented for development):
    // const token = await this.getAccessToken();
    // const response = await fetch(`${this.config.baseUrl}/bookingapi/services`, {
    //   headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    // });
    // return response.json();
    
    // DEVELOPMENT - Using mock data
    return {
      response: true,
      data: {
        services: this.mockData.services
      }
    };
  }

  async getServicesByCategory(categoryKey: string): Promise<SetmoreApiResponse<{ services: SetmoreService[] }>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // For now, return all services (can be enhanced with actual category filtering)
    return {
      response: true,
      data: {
        services: this.mockData.services
      }
    };
  }

  // Staff
  async getAllStaff(): Promise<SetmoreApiResponse<{ staffs: SetmoreStaff[] }>> {
    // For development - return mock data immediately
    // In production, uncomment the API call below and remove this mock return
    
    // PRODUCTION CODE (commented for development):
    // const token = await this.getAccessToken();
    // const response = await fetch(`${this.config.baseUrl}/bookingapi/staffs`, {
    //   headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    // });
    // return response.json();
    
    // DEVELOPMENT - Using mock data
    return {
      response: true,
      data: {
        staffs: this.mockData.staff
      }
    };
  }

  // Time slots
  async getAvailableSlots(request: SetmoreSlotsRequest): Promise<SetmoreApiResponse<{ slots: SetmoreTimeSlot[] }>> {
    // For development - return mock data immediately
    // In production, uncomment the API call below and remove this mock return
    
    // PRODUCTION CODE (commented for development):
    // const token = await this.getAccessToken();
    // const response = await fetch(`${this.config.baseUrl}/bookingapi/slots`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify(request)
    // });
    // return response.json();
    
    // DEVELOPMENT - Generate mock time slots
    const slots: SetmoreTimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17;  // 5 PM
    const slotDuration = 30; // 30 minutes
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const dateTimeString = `${request.selected_date} ${timeString}`;
        
        // Randomly make some slots unavailable (simulating real scheduling)
        const isAvailable = Math.random() > 0.3;
        
        slots.push({
          slot_time: timeString,
          slot_date_time: dateTimeString,
          is_available: isAvailable
        });
      }
    }
    
    return {
      response: true,
      data: {
        slots: slots.filter(slot => slot.is_available).slice(0, request.slot_limit || 20)
      }
    };
  }

  // Customers
  async createCustomer(customer: Partial<SetmoreCustomer>): Promise<SetmoreApiResponse<{ customer: SetmoreCustomer }>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newCustomer: SetmoreCustomer = {
      key: `customer_${Date.now()}`,
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      email_id: customer.email_id || "",
      country_code: customer.country_code || "+381",
      cell_phone: customer.cell_phone || "",
      work_phone: customer.work_phone,
      home_phone: customer.home_phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      postal_code: customer.postal_code,
      country: customer.country,
      comment: customer.comment
    };
    
    this.mockData.customers.push(newCustomer);
    
    return {
      response: true,
      msg: "Customer created successfully",
      data: {
        customer: newCustomer
      }
    };
  }

  async getCustomer(customerKey: string): Promise<SetmoreApiResponse<{ customer: SetmoreCustomer }>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const customer = this.mockData.customers.find(c => c.key === customerKey);
    
    if (!customer) {
      return {
        response: false,
        msg: "Customer not found",
        data: { customer: {} as SetmoreCustomer }
      };
    }
    
    return {
      response: true,
      data: {
        customer
      }
    };
  }

  // Appointments
  async createAppointment(request: SetmoreAppointmentRequest): Promise<SetmoreApiResponse<{ appointment: SetmoreAppointment }>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const service = this.mockData.services.find(s => s.key === request.service_key);
    const newAppointment: SetmoreAppointment = {
      key: `appointment_${Date.now()}`,
      start_time: request.start_time,
      end_time: request.end_time,
      staff_key: request.staff_key,
      service_key: request.service_key,
      customer_key: request.customer_key,
      label: request.label,
      comment: request.comment,
      cost: service?.cost || 0,
      currency: service?.currency || "EUR"
    };
    
    this.mockData.appointments.push(newAppointment);
    
    return {
      response: true,
      msg: "Appointment created successfully",
      data: {
        appointment: newAppointment
      }
    };
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<SetmoreApiResponse<{ appointments: SetmoreAppointment[] }>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // For mock data, return all appointments (can be filtered by date in real implementation)
    return {
      response: true,
      data: {
        appointments: this.mockData.appointments
      }
    };
  }

  // Helper method to get service by key
  getServiceByKey(serviceKey: string): SetmoreService | undefined {
    return this.mockData.services.find(s => s.key === serviceKey);
  }

  // Helper method to get staff by key
  getStaffByKey(staffKey: string): SetmoreStaff | undefined {
    return this.mockData.staff.find(s => s.key === staffKey);
  }
}

// Create a singleton instance for the application
let setmoreService: SetmoreApiService | null = null;

export function getSetmoreService(): SetmoreApiService {
  if (!setmoreService) {
    const config: SetmoreConfig = {
      refreshToken: process.env.SETMORE_REFRESH_TOKEN || "mock_refresh_token",
      baseUrl: "https://developer.setmore.com/api/v1"
    };
    setmoreService = new SetmoreApiService(config);
  }
  return setmoreService;
}