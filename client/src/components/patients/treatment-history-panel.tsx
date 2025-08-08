import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Activity, Calendar, User, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useTreatmentHistory, useCreateTreatmentHistory } from "@/hooks/use-treatment-history";
import { useCreateToothRecord } from "@/hooks/use-tooth-records";
import { useToast } from "@/hooks/use-toast";

interface TreatmentHistoryPanelProps {
  patientId: number;
}

export function TreatmentHistoryPanel({ patientId }: TreatmentHistoryPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [treatmentType, setTreatmentType] = useState("");
  const [description, setDescription] = useState("");
  const [toothNumbers, setToothNumbers] = useState("");
  const [duration, setDuration] = useState(30);
  const [cost, setCost] = useState(0);
  const [notes, setNotes] = useState("");

  const { data: treatments, isLoading } = useTreatmentHistory(patientId);
  const createTreatmentMutation = useCreateTreatmentHistory();
  const createToothRecordMutation = useCreateToothRecord();
  const { toast } = useToast();

  // Function to create tooth records based on treatment
  const createToothRecordsForTreatment = async (toothNumbers: string, treatmentType: string, description: string) => {
    if (!toothNumbers.trim()) return;
    
    // Parse tooth numbers (supports formats like "1,2,3" or "14-16" or "18 19 20")
    let teeth: number[] = [];
    const parts = toothNumbers.replace(/[\s,]+/g, ',').split(',');
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (start && end) {
          for (let i = start; i <= end; i++) {
            teeth.push(i);
          }
        }
      } else {
        const tooth = parseInt(part.trim());
        if (tooth) teeth.push(tooth);
      }
    }
    
    // Create tooth records for each tooth
    for (const toothNumber of teeth) {
      try {
        // Determine condition based on treatment type
        let condition = "healthy";
        if (treatmentType.toLowerCase().includes("filling")) condition = "filled";
        else if (treatmentType.toLowerCase().includes("crown")) condition = "crown";
        else if (treatmentType.toLowerCase().includes("root canal")) condition = "root_canal";
        else if (treatmentType.toLowerCase().includes("extraction")) condition = "extracted";
        else if (treatmentType.toLowerCase().includes("implant")) condition = "implant";
        else if (treatmentType.toLowerCase().includes("cleaning")) condition = "healthy";
        
        await createToothRecordMutation.mutateAsync({
          patientId,
          toothNumber,
          condition: condition as any,
          treatment: `${treatmentType}: ${description}`,
          notes: `Auto-created from treatment history`,
          color: getColorForCondition(condition),
          isCompleted: true,
        });
      } catch (error) {
        console.warn(`Failed to create tooth record for tooth ${toothNumber}:`, error);
      }
    }
  };
  
  const getColorForCondition = (condition: string) => {
    const colors: { [key: string]: string } = {
      healthy: "#ffffff",
      filled: "#4444ff",
      crown: "#ffaa00",
      root_canal: "#8844ff",
      extracted: "#666666",
      implant: "#44aaff",
    };
    return colors[condition] || "#ffffff";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentType.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Treatment type and description are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTreatmentMutation.mutateAsync({
        patientId,
        treatmentType: treatmentType.trim(),
        description: description.trim(),
        toothNumbers: toothNumbers.trim() || undefined,
        duration,
        cost,
        notes: notes.trim() || undefined,
      });

      // Create tooth records if tooth numbers were specified
      if (toothNumbers.trim()) {
        await createToothRecordsForTreatment(toothNumbers.trim(), treatmentType.trim(), description.trim());
      }

      toast({
        title: "Success",
        description: "Treatment history added successfully. Odontogram updated.",
      });

      // Reset form
      setTreatmentType("");
      setDescription("");
      setToothNumbers("");
      setDuration(30);
      setCost(0);
      setNotes("");
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add treatment history",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'planned': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Treatment History
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Treatment History</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Treatment Type</label>
                  <Select value={treatmentType} onValueChange={setTreatmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dental Cleaning">Dental Cleaning</SelectItem>
                      <SelectItem value="Tooth Filling">Tooth Filling</SelectItem>
                      <SelectItem value="Root Canal">Root Canal</SelectItem>
                      <SelectItem value="Crown Installation">Crown Installation</SelectItem>
                      <SelectItem value="Tooth Extraction">Tooth Extraction</SelectItem>
                      <SelectItem value="Orthodontic Treatment">Orthodontic Treatment</SelectItem>
                      <SelectItem value="Dental Implant">Dental Implant</SelectItem>
                      <SelectItem value="Teeth Whitening">Teeth Whitening</SelectItem>
                      <SelectItem value="Periodontal Treatment">Periodontal Treatment</SelectItem>
                      <SelectItem value="Emergency Treatment">Emergency Treatment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the treatment performed..."
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tooth Numbers (Optional)</label>
                  <Input
                    value={toothNumbers}
                    onChange={(e) => setToothNumbers(e.target.value)}
                    placeholder="ISO 3950: e.g., 11,12,13 or 14-16 or 21 22"
                  />
                  <p className="text-xs text-gray-500">Use ISO 3950 (FDI) numbering. Will automatically update odontogram.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                      min="1"
                      max="480"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cost (€)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={cost / 100}
                      onChange={(e) => setCost(Math.round(parseFloat(e.target.value) * 100) || 0)}
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Additional Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about the treatment..."
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTreatmentMutation.isPending}>
                    {createTreatmentMutation.isPending ? "Adding..." : "Add Treatment"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : treatments && Array.isArray(treatments) && treatments.length > 0 ? (
          <div className="space-y-4">
            {treatments.map((treatment: any) => (
              <div key={treatment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{treatment.treatmentType}</h3>
                    <Badge className={getStatusColor(treatment.status)}>
                      {treatment.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(treatment.performedAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{treatment.description}</p>
                
                {treatment.toothNumbers && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Teeth:</strong> {treatment.toothNumbers}
                  </div>
                )}
                
                {treatment.notes && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <strong>Notes:</strong> {treatment.notes}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{treatment.performedBy}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{treatment.duration}min</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    <span className="font-medium">{formatCurrency(treatment.cost)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No treatment history yet</p>
            <p className="text-sm">Click "Add Treatment" to record the first treatment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}