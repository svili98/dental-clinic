import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { usePatientToothRecords, useCreateToothRecord, useUpdateToothRecord } from "@/hooks/use-tooth-records";
import { useCreateTreatmentHistory } from "@/hooks/use-treatment-history";
import { useToast } from "@/hooks/use-toast";
import type { ToothRecord, InsertToothRecord } from "@shared/schema";
import { Loader2, Plus } from "lucide-react";

interface OdontogramISOProps {
  patientId: number;
  patientAge?: number;
}

// ISO 3950 (FDI) Tooth numbering system
const ADULT_TEETH_ISO = {
  upper: {
    right: [18, 17, 16, 15, 14, 13, 12, 11],
    left: [21, 22, 23, 24, 25, 26, 27, 28]
  },
  lower: {
    right: [48, 47, 46, 45, 44, 43, 42, 41],
    left: [31, 32, 33, 34, 35, 36, 37, 38]
  }
};

const CHILDREN_TEETH_ISO = {
  upper: {
    right: [55, 54, 53, 52, 51],
    left: [61, 62, 63, 64, 65]
  },
  lower: {
    right: [85, 84, 83, 82, 81],
    left: [71, 72, 73, 74, 75]
  }
};

const CONDITION_COLORS = {
  healthy: "#ffffff",
  caries: "#ff4444",
  filled: "#4444ff", 
  crown: "#ffaa00",
  bridge: "#aa44ff",
  implant: "#44aaff",
  extracted: "#666666",
  impacted: "#ff8800",
  fractured: "#ff6666",
  root_canal: "#8844ff",
  veneer: "#44ff88",
  wisdom_tooth: "#ffff44",
  missing: "#cccccc",
  needs_treatment: "#ff8844",
} as const;

// Tooth surfaces for notation (FDI system)
const TOOTH_SURFACES = {
  // Universal surfaces for all teeth
  M: "Mesial", // Towards midline
  D: "Distal", // Away from midline
  L: "Lingual/Palatal", // Tongue/palate side
  B: "Buccal/Labial", // Cheek/lip side
  // Occlusal surfaces for posterior teeth
  O: "Occlusal", // Chewing surface
  // Incisal surfaces for anterior teeth
  I: "Incisal", // Cutting edge
} as const;

const SURFACE_POSITIONS = {
  M: { x: 18, y: 40 },
  D: { x: 102, y: 40 },
  O: { x: 60, y: 24 },
  I: { x: 60, y: 24 },
  L: { x: 60, y: 12 },
  B: { x: 60, y: 68 },
} as const;

const CONDITION_NAMES = {
  healthy: "Healthy",
  caries: "Caries",
  filled: "Filled",
  crown: "Crown",
  bridge: "Bridge", 
  implant: "Implant",
  extracted: "Extracted",
  impacted: "Impacted",
  fractured: "Fractured",
  root_canal: "Root Canal",
  veneer: "Veneer",
  wisdom_tooth: "Wisdom Tooth",
  missing: "Missing",
  needs_treatment: "Needs Treatment",
} as const;

interface ToothProps {
  toothNumber: number;
  record?: ToothRecord;
  onUpdate: (toothNumber: number, record?: ToothRecord) => void;
  isChild?: boolean;
}

function Tooth({ toothNumber, record, onUpdate, isChild = false }: ToothProps) {
  const condition = record?.condition || "healthy";
  const color = record?.color || CONDITION_COLORS[condition as keyof typeof CONDITION_COLORS];
  const surfaces = record?.surfaces ? record.surfaces.split(',').map(s => s.trim()) : [];
  
  return (
    <button
      onClick={() => onUpdate(toothNumber, record)}
      className={`relative border border-gray-300 rounded-t-lg hover:ring-2 hover:ring-blue-500 transition-all ${
        isChild ? 'w-6 h-8' : 'w-8 h-10'
      }`}
      style={{ backgroundColor: color }}
      title={`Tooth ${toothNumber}${record ? ` - ${CONDITION_NAMES[condition as keyof typeof CONDITION_NAMES]}` : ""}${surfaces.length > 0 ? ` (${surfaces.join(', ')})` : ""}`}
    >
      <span className={`absolute inset-0 flex items-center justify-center font-medium text-gray-800 ${
        isChild ? 'text-xs' : 'text-xs'
      }`}>
        {toothNumber}
      </span>
      
      {/* Surface notation indicators */}
      {surfaces.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {surfaces.map(surface => {
            const pos = SURFACE_POSITIONS[surface as keyof typeof SURFACE_POSITIONS];
            if (!pos) return null;
            return (
              <div
                key={surface}
                className="absolute w-1 h-1 bg-red-500 rounded-full"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            );
          })}
        </div>
      )}
      
      {record && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
      )}
    </button>
  );
}

interface ToothDialogProps {
  toothNumber: number;
  record?: ToothRecord;
  patientId: number;
  isOpen: boolean;
  onClose: () => void;
}

function ToothDialog({ toothNumber, record, patientId, isOpen, onClose }: ToothDialogProps) {
  const [condition, setCondition] = useState(record?.condition || "healthy");
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>(
    record?.surfaces ? record.surfaces.split(',').map(s => s.trim()) : []
  );
  const [treatment, setTreatment] = useState(record?.treatment || "");
  const [notes, setNotes] = useState(record?.notes || "");
  const [treatmentCost, setTreatmentCost] = useState(0);
  const [treatmentCurrency, setTreatmentCurrency] = useState("EUR");
  const [createOutstandingBalance, setCreateOutstandingBalance] = useState(false);
  
  const { toast } = useToast();
  const createMutation = useCreateToothRecord();
  const updateMutation = useUpdateToothRecord();
  const createTreatmentMutation = useCreateTreatmentHistory();
  
  const getTreatmentTypeFromCondition = (condition: string) => {
    const treatmentMap: { [key: string]: string } = {
      filled: "Tooth Filling",
      crown: "Crown Installation", 
      root_canal: "Root Canal",
      extracted: "Tooth Extraction",
      implant: "Dental Implant",
      veneer: "Veneer Application",
      bridge: "Bridge Installation",
      caries: "Caries Treatment",
      fractured: "Fracture Repair",
      impacted: "Impacted Tooth Treatment",
      needs_treatment: "Treatment Planning",
      healthy: "Dental Cleaning"
    };
    return treatmentMap[condition] || "Dental Treatment";
  };
  
  const getEstimatedCost = (condition: string) => {
    const costMap: { [key: string]: number } = {
      filled: 8000, // €80.00
      crown: 25000, // €250.00
      root_canal: 30000, // €300.00
      extracted: 12000, // €120.00
      implant: 150000, // €1500.00
      veneer: 40000, // €400.00
      bridge: 80000, // €800.00
      caries: 6000, // €60.00
      fractured: 15000, // €150.00
      impacted: 20000, // €200.00
      needs_treatment: 5000, // €50.00
      healthy: 4500 // €45.00
    };
    return costMap[condition] || 5000; // Default €50.00
  };
  
  const toggleSurface = (surface: string) => {
    setSelectedSurfaces(prev => 
      prev.includes(surface) 
        ? prev.filter(s => s !== surface)
        : [...prev, surface]
    );
  };

  const isAnteriorTooth = (toothNumber: number) => {
    const toothStr = toothNumber.toString();
    if (toothStr.length === 2) {
      const lastDigit = parseInt(toothStr[1]);
      return lastDigit >= 1 && lastDigit <= 3; // Central, lateral incisors, canines
    }
    return false;
  };

  const isPosteriorTooth = (toothNumber: number) => {
    const toothStr = toothNumber.toString();
    if (toothStr.length === 2) {
      const lastDigit = parseInt(toothStr[1]);
      return lastDigit >= 4 && lastDigit <= 8; // Premolars and molars
    }
    return false;
  };

  const handleSave = async () => {
    try {
      const surfacesString = selectedSurfaces.join(',');
      const costInSmallestUnit = treatmentCost > 0 ? Math.round(treatmentCost * 100) : getEstimatedCost(condition);
      
      const data: InsertToothRecord = {
        patientId,
        toothNumber,
        condition: condition as any,
        surfaces: surfacesString || undefined,
        treatment: treatment || undefined,
        notes: notes || undefined,
        color: CONDITION_COLORS[condition as keyof typeof CONDITION_COLORS],
        isCompleted: true,
      };
      
      // Save tooth record
      if (record) {
        await updateMutation.mutateAsync({ id: record.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      
      // Create corresponding treatment history entry
      const treatmentType = getTreatmentTypeFromCondition(condition);
      const treatmentDescription = treatment || `${treatmentType} performed on tooth ${toothNumber}`;
      
      const treatmentData = {
        patientId,
        treatmentType,
        description: treatmentDescription + (surfacesString ? ` (surfaces: ${surfacesString})` : ''),
        toothNumbers: toothNumber.toString(),
        duration: 45, // Default 45 minutes
        cost: costInSmallestUnit,
        currency: treatmentCurrency,
        notes: notes ? `Odontogram entry: ${notes}` : 'Added via odontogram',
      };
      
      await createTreatmentMutation.mutateAsync(treatmentData);
      
      // Create outstanding balance if requested
      if (createOutstandingBalance && treatmentCost > 0) {
        try {
          await fetch(`/api/patients/${patientId}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: -costInSmallestUnit, // Negative amount for outstanding balance
              currency: treatmentCurrency,
              paymentMethod: 'outstanding',
              paymentStatus: 'pending',
              treatmentContext: `Treatment: ${treatmentType}`,
              doctorName: 'Dr. Smith',
              notes: `Outstanding balance for tooth ${toothNumber} treatment`
            })
          });
        } catch (paymentError) {
          console.error('Failed to create outstanding balance:', paymentError);
        }
      }
      
      toast({
        title: "Success",
        description: `Tooth ${toothNumber} ${record ? 'updated' : 'created'} with treatment history${createOutstandingBalance ? ' and outstanding balance' : ''}`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${record ? 'update' : 'create'} tooth record or treatment history`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tooth {toothNumber} (ISO 3950)</DialogTitle>
          <DialogDescription>
            Edit condition, treatment details, and notes for tooth {toothNumber}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONDITION_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: CONDITION_COLORS[key as keyof typeof CONDITION_COLORS] }}
                      />
                      {name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Affected Surfaces</Label>
            <div className="mt-2">
              {/* Visual tooth surface selector */}
              <div className="relative mx-auto mb-4" style={{ width: "120px", height: "80px" }}>
                <svg viewBox="0 0 120 80" className="w-full h-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
                  {/* Tooth shape */}
                  <rect x="30" y="20" width="60" height="40" rx="8" fill="#f8f9fa" stroke="#dee2e6" strokeWidth="1" className="dark:fill-gray-700 dark:stroke-gray-500"/>
                  
                  {/* Surface markers */}
                  {Object.entries(SURFACE_POSITIONS).map(([surface, pos]) => {
                    // Show O for posterior teeth, I for anterior teeth
                    if (surface === 'O' && !isPosteriorTooth(toothNumber)) return null;
                    if (surface === 'I' && !isAnteriorTooth(toothNumber)) return null;
                    
                    const isSelected = selectedSurfaces.includes(surface);
                    return (
                      <g key={surface}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="8"
                          fill={isSelected ? "#3b82f6" : "#e5e7eb"}
                          stroke={isSelected ? "#1d4ed8" : "#9ca3af"}
                          strokeWidth="1"
                          className="cursor-pointer hover:fill-blue-200"
                          onClick={() => toggleSurface(surface)}
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 2}
                          textAnchor="middle"
                          fontSize="8"
                          fill={isSelected ? "white" : "#374151"}
                          className="cursor-pointer select-none"
                          onClick={() => toggleSurface(surface)}
                        >
                          {surface}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* Surface buttons */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TOOTH_SURFACES).map(([key, name]) => {
                  // Show O for posterior teeth, I for anterior teeth
                  if (key === 'O' && !isPosteriorTooth(toothNumber)) return null;
                  if (key === 'I' && !isAnteriorTooth(toothNumber)) return null;
                  
                  const isSelected = selectedSurfaces.includes(key);
                  return (
                    <Button
                      key={key}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSurface(key)}
                      className="text-xs"
                    >
                      {key} - {name}
                    </Button>
                  );
                })}
              </div>
              
              {selectedSurfaces.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {selectedSurfaces.join(', ')}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="treatment">Treatment</Label>
            <Input
              id="treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Description of treatment performed"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this tooth"
              rows={3}
            />
          </div>
          
          {/* Treatment Cost and Payment Options */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium">Treatment Cost & Payment</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label htmlFor="cost" className="text-xs">Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={treatmentCost}
                  onChange={(e) => setTreatmentCost(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="currency" className="text-xs">Currency</Label>
                <Select value={treatmentCurrency} onValueChange={setTreatmentCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="RSD">RSD (дин)</SelectItem>
                    <SelectItem value="CHF">CHF (Fr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-3">
              <input
                type="checkbox"
                id="outstanding"
                checked={createOutstandingBalance}
                onChange={(e) => setCreateOutstandingBalance(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="outstanding" className="text-xs">
                Create outstanding balance (patient owes this amount)
              </Label>
            </div>
            
            {treatmentCost === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Estimated cost: {treatmentCurrency === 'EUR' ? '€' : treatmentCurrency === 'RSD' ? '' : 'Fr'}{(getEstimatedCost(condition) / 100).toFixed(2)}{treatmentCurrency === 'RSD' ? ' дин' : ''}
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {record ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OdontogramISO({ patientId, patientAge }: OdontogramISOProps) {
  const [selectedTooth, setSelectedTooth] = useState<{ number: number; record?: ToothRecord } | null>(null);
  const [activeTab, setActiveTab] = useState("adult");
  
  const { data: toothRecords, isLoading, error } = usePatientToothRecords(patientId);
  
  // Determine if we should show child teeth based on age
  const isChild = patientAge && patientAge < 18;
  const defaultTab = isChild ? "child" : "adult";
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Odontogram (ISO 3950)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Odontogram (ISO 3950)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load odontogram data</p>
        </CardContent>
      </Card>
    );
  }
  
  // Create a map of tooth records by tooth number
  const toothRecordMap = new Map<number, ToothRecord>();
  toothRecords?.forEach(record => {
    toothRecordMap.set(record.toothNumber, record);
  });
  
  const handleToothClick = (toothNumber: number, record?: ToothRecord) => {
    setSelectedTooth({ number: toothNumber, record });
  };

  const renderTeethRow = (teeth: number[], isChild = false) => (
    <div className="flex justify-center gap-1">
      {teeth.map(toothNumber => (
        <Tooth
          key={toothNumber}
          toothNumber={toothNumber}
          record={toothRecordMap.get(toothNumber)}
          onUpdate={handleToothClick}
          isChild={isChild}
        />
      ))}
    </div>
  );
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Odontogram
            <div className="flex gap-2">
              <Badge variant="outline">ISO 3950 (FDI)</Badge>
              <Badge variant="secondary">{toothRecords?.length || 0} Records</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue={defaultTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="adult">Adult Teeth</TabsTrigger>
              <TabsTrigger value="child">Primary Teeth</TabsTrigger>
            </TabsList>
            
            <TabsContent value="adult" className="space-y-6 mt-6">
              {/* Adult Upper Jaw - FDI Layout */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-4">Upper Jaw (Maxilla)</h3>
                <div className="flex justify-center items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Right Upper</p>
                    {renderTeethRow(ADULT_TEETH_ISO.upper.right)}
                  </div>
                  <div className="w-px h-12 bg-gray-300 mx-4"></div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400 mb-1">Left Upper</p>
                    {renderTeethRow(ADULT_TEETH_ISO.upper.left)}
                  </div>
                </div>
              </div>
              
              {/* Adult Lower Jaw - FDI Layout */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-4">Lower Jaw (Mandible)</h3>
                <div className="flex justify-center items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Right Lower</p>
                    {renderTeethRow(ADULT_TEETH_ISO.lower.right)}
                  </div>
                  <div className="w-px h-12 bg-gray-300 mx-4"></div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400 mb-1">Left Lower</p>
                    {renderTeethRow(ADULT_TEETH_ISO.lower.left)}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="child" className="space-y-6 mt-6">
              {/* Child Upper Jaw - FDI Layout */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-4">Upper Jaw (Maxilla)</h3>
                <div className="flex justify-center items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Right Upper</p>
                    {renderTeethRow(CHILDREN_TEETH_ISO.upper.right, true)}
                  </div>
                  <div className="w-px h-10 bg-gray-300 mx-4"></div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400 mb-1">Left Upper</p>
                    {renderTeethRow(CHILDREN_TEETH_ISO.upper.left, true)}
                  </div>
                </div>
              </div>
              
              {/* Child Lower Jaw - FDI Layout */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-4">Lower Jaw (Mandible)</h3>
                <div className="flex justify-center items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Right Lower</p>
                    {renderTeethRow(CHILDREN_TEETH_ISO.lower.right, true)}
                  </div>
                  <div className="w-px h-10 bg-gray-300 mx-4"></div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400 mb-1">Left Lower</p>
                    {renderTeethRow(CHILDREN_TEETH_ISO.lower.left, true)}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Legend */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Legend</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(CONDITION_NAMES).map(([key, name]) => (
                <div key={key} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded border border-gray-300"
                    style={{ backgroundColor: CONDITION_COLORS[key as keyof typeof CONDITION_COLORS] }}
                  />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedTooth && (
        <ToothDialog
          toothNumber={selectedTooth.number}
          record={selectedTooth.record}
          patientId={patientId}
          isOpen={!!selectedTooth}
          onClose={() => setSelectedTooth(null)}
        />
      )}
    </>
  );
}