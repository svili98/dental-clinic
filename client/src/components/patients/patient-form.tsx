import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { insertPatientSchema, type InsertPatient, type Patient, PATIENT_STATUSES } from "@shared/schema";
import { X, Upload, FileText } from "lucide-react";
import { format } from "date-fns";

interface PatientFormProps {
  initialData?: Patient;
  onSubmit: (data: InsertPatient, files?: File[]) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const commonMedicalConditions = [
  "Diabetes", "Hypertension", "Heart Disease", "Allergies", "Asthma", 
  "Arthritis", "Depression", "Anxiety", "High Cholesterol", "Thyroid Disorder",
  "Kidney Disease", "Liver Disease", "Cancer History", "Stroke History", "Epilepsy"
];

export function PatientForm({ initialData, onSubmit, loading, onCancel }: PatientFormProps) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { data: existingConditions } = useQuery<string[]>({
    queryKey: ['/api/patients', initialData?.id, 'medical-conditions'],
    enabled: !!initialData?.id,
  });

  useEffect(() => {
    if (existingConditions && existingConditions.length > 0) {
      setSelectedConditions(existingConditions);
    }
  }, [existingConditions]);

  const form = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      phone: initialData.phone,
      email: initialData.email || "",
      dateOfBirth: initialData.dateOfBirth,
      address: initialData.address || "",
      gender: initialData.gender as "Male" | "Female",
      jmbg: initialData.jmbg,
      statusId: initialData.statusId || 1,
      medicalConditions: [],
    } : {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      address: "",
      gender: "Male",
      jmbg: "",
      statusId: 1,
      medicalConditions: [],
    },
  });

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions(prev => [...prev, condition]);
    } else {
      setSelectedConditions(prev => prev.filter(c => c !== condition));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: InsertPatient) => {
    const formDataWithConditions = {
      ...data,
      medicalConditions: selectedConditions,
    };
    onSubmit(formDataWithConditions, uploadedFiles);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Status *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PATIENT_STATUSES).map(status => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${status.color}-500`}></div>
                              <span>{status.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="jmbg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>JMBG *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter JMBG (13 digits)" maxLength={13} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter address" rows={3} {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medical Conditions Section */}
            <div className="space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Conditions</h3>
                <p className="text-sm text-gray-500 mb-4">Select any existing medical conditions:</p>
                
                {selectedConditions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected conditions:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedConditions.map((condition) => (
                        <Badge key={condition} variant="secondary" className="px-3 py-1">
                          {condition}
                          <button
                            type="button"
                            onClick={() => handleConditionChange(condition, false)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonMedicalConditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={selectedConditions.includes(condition)}
                        onCheckedChange={(checked) => handleConditionChange(condition, !!checked)}
                      />
                      <label htmlFor={condition} className="text-sm text-gray-700 cursor-pointer">
                        {condition}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Documents</h3>
                <p className="text-sm text-gray-500 mb-4">Upload medical records, ID documents, or other relevant files:</p>
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                    Choose Files
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Supported: PDF, JPG, PNG, DOC, DOCX (max 10MB each)</p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Uploaded files:</p>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Saving..." : initialData ? "Update Patient" : "Add Patient"}
              </Button>
            </div>
          </form>
        </Form>
  );
}
