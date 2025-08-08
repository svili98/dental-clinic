import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { useMedicalNotes, useCreateMedicalNote } from "@/hooks/use-medical-notes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";

interface MedicalNotesProps {
  patientId: number;
}

export function MedicalNotes({ patientId }: MedicalNotesProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("general");

  const { data: notes, isLoading } = useMedicalNotes(patientId);
  const createNoteMutation = useCreateMedicalNote();
  const { toast } = useToast();
  const { t } = useTranslation();

  const notesArray = Array.isArray(notes) ? notes : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        patientId,
        title: title.trim(),
        content: content.trim(),
        noteType,
      });

      toast({
        title: "Success",
        description: "Medical note added successfully",
      });

      // Reset form
      setTitle("");
      setContent("");
      setNoteType("general");
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add medical note",
        variant: "destructive",
      });
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'treatment': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'diagnosis': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'follow-up': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {t.medicalNotes}
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {t.addMedicalNote}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t.addMedicalNote}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Note Type</label>
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title..."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter note content..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createNoteMutation.isPending}>
                    {createNoteMutation.isPending ? "Adding..." : "Add Note"}
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
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : notesArray.length > 0 ? (
          <div className="space-y-4">
            {notesArray.map((note: any) => (
              <div key={note.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{note.title}</h3>
                    <Badge className={getNoteTypeColor(note.noteType)}>
                      {note.noteType}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{note.content}</p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <User className="h-3 w-3 mr-1" />
                  <span>{note.createdBy}</span>
                  <Calendar className="h-3 w-3 ml-4 mr-1" />
                  <span>{format(new Date(note.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No medical notes yet</p>
            <p className="text-sm">Click "Add Note" to create the first medical note</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}