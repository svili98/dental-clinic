import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import type { ToothRecord, InsertToothRecord } from "@shared/schema";
import { Loader2, Plus } from "lucide-react";

interface OdontogramProps {
  patientId: number;
}

// Tooth numbering according to Universal Numbering System
const ADULT_TEETH = {
  upper: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  lower: [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17],
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
}

function Tooth({ toothNumber, record, onUpdate }: ToothProps) {
  const condition = record?.condition || "healthy";
  const color = record?.color || CONDITION_COLORS[condition as keyof typeof CONDITION_COLORS];
  
  return (
    <button
      onClick={() => onUpdate(toothNumber, record)}
      className="relative w-8 h-10 border border-gray-300 rounded-t-lg hover:ring-2 hover:ring-blue-500 transition-all"
      style={{ backgroundColor: color }}
      title={`Tooth ${toothNumber}${record ? ` - ${CONDITION_NAMES[condition as keyof typeof CONDITION_NAMES]}` : ""}`}
    >
      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
        {toothNumber}
      </span>
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
  const [surfaces, setSurfaces] = useState(record?.surfaces || "");
  const [treatment, setTreatment] = useState(record?.treatment || "");
  const [notes, setNotes] = useState(record?.notes || "");
  
  const { toast } = useToast();
  const createMutation = useCreateToothRecord();
  const updateMutation = useUpdateToothRecord();
  
  const handleSave = async () => {
    try {
      const data: InsertToothRecord = {
        patientId,
        toothNumber,
        condition: condition as any,
        surfaces: surfaces || undefined,
        treatment: treatment || undefined,
        notes: notes || undefined,
        color: CONDITION_COLORS[condition as keyof typeof CONDITION_COLORS],
        isCompleted: true,
      };
      
      if (record) {
        await updateMutation.mutateAsync({ id: record.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      
      toast({
        title: "Success",
        description: `Tooth ${toothNumber} record ${record ? 'updated' : 'created'} successfully`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${record ? 'update' : 'create'} tooth record`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tooth {toothNumber}</DialogTitle>
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
            <Label htmlFor="surfaces">Affected Surfaces (e.g., MO, DO, MOD)</Label>
            <Input
              id="surfaces"
              value={surfaces}
              onChange={(e) => setSurfaces(e.target.value)}
              placeholder="M, O, D, B, L, I"
            />
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

export function Odontogram({ patientId }: OdontogramProps) {
  const [selectedTooth, setSelectedTooth] = useState<{ number: number; record?: ToothRecord } | null>(null);
  
  const { data: toothRecords, isLoading, error } = usePatientToothRecords(patientId);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Odontogram</CardTitle>
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
          <CardTitle>Odontogram</CardTitle>
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
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Odontogram
            <div className="flex gap-2">
              <Badge variant="outline">Universal Numbering System</Badge>
              <Badge variant="secondary">{toothRecords?.length || 0} Records</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Upper Jaw */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Upper Jaw (Maxilla)</h3>
              <div className="flex justify-center gap-1">
                {ADULT_TEETH.upper.map(toothNumber => (
                  <Tooth
                    key={toothNumber}
                    toothNumber={toothNumber}
                    record={toothRecordMap.get(toothNumber)}
                    onUpdate={handleToothClick}
                  />
                ))}
              </div>
            </div>
            
            {/* Lower Jaw */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Lower Jaw (Mandible)</h3>
              <div className="flex justify-center gap-1">
                {ADULT_TEETH.lower.map(toothNumber => (
                  <Tooth
                    key={toothNumber}
                    toothNumber={toothNumber}
                    record={toothRecordMap.get(toothNumber)}
                    onUpdate={handleToothClick}
                  />
                ))}
              </div>
            </div>
          </div>
          
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