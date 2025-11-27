import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash, Edit, Check, X, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormField {
  id: string;
  field_key: string;
  label: string;
  placeholder: string | null;
  is_required: boolean;
  field_type: 'text' | 'tel' | 'email' | 'textarea' | 'select';
  options: any;
  icon_name: string | null;
  position: number;
  is_active: boolean;
}

const iconOptions = [
  'User', 'Phone', 'MapPin', 'Calendar', 'Mail', 'Home', 'Info', 'Plus', 'Minus'
];

const OrderFormSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Partial<FormField> | null>(null);

  const { data: fields, isLoading } = useQuery<FormField[]>({
    queryKey: ["orderFormFields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_form_settings')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as FormField[];
    },
  });

  const mutation = useMutation({
    mutationFn: async (field: Partial<FormField>) => {
      if (field.id) {
        // Update
        const { error } = await supabase
          .from('order_form_settings')
          .update(field)
          .eq('id', field.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('order_form_settings')
          .insert(field as FormField);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderFormFields"] });
      toast({ title: "Succès", description: "Champ de formulaire sauvegardé." });
      setIsModalOpen(false);
      setEditingField(null);
    },
    onError: (error) => {
      console.error("Error saving field:", error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder le champ.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('order_form_settings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderFormFields"] });
      toast({ title: "Succès", description: "Champ supprimé." });
    },
    onError: (error) => {
      console.error("Error deleting field:", error);
      toast({ title: "Erreur", description: "Impossible de supprimer le champ.", variant: "destructive" });
    },
  });

  const handleEdit = (field: FormField) => {
    setEditingField(field);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingField({
      field_key: `custom_${Date.now()}`,
      label: "Nouveau champ",
      is_required: false,
      field_type: 'text',
      is_active: true,
      position: (fields?.length || 0) + 1,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingField) {
      mutation.mutate(editingField);
    }
  };
  
  const handleMove = (id: string, direction: 'up' | 'down') => {
    if (!fields) return;
    
    const index = fields.findIndex(f => f.id === id);
    if (index === -1) return;
    
    const newPosition = direction === 'up' ? index - 1 : index + 1;
    
    if (newPosition < 0 || newPosition >= fields.length) return;
    
    const fieldToMove = fields[index];
    const fieldToSwap = fields[newPosition];
    
    // Swap positions
    const updates = [
      { id: fieldToMove.id, position: fieldToSwap.position },
      { id: fieldToSwap.id, position: fieldToMove.position },
    ];
    
    // Execute mutations sequentially
    updates.forEach(update => {
      mutation.mutate(update);
    });
  };

  if (isLoading) {
    return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /> Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configuration du Formulaire de Commande</h1>
        <Button onClick={handleNew} className="flex items-center gap-2">
          <Plus size={18} /> Ajouter un champ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Champs Actifs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Pos.</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Requis</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields?.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {field.position}
                    <div className="flex flex-col">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0"
                        onClick={() => handleMove(field.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp size={12} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0"
                        onClick={() => handleMove(field.id, 'down')}
                        disabled={index === (fields.length - 1)}
                      >
                        <ArrowDown size={12} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{field.label}</TableCell>
                  <TableCell>{field.field_type}</TableCell>
                  <TableCell>
                    {field.is_required ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(field)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(field.id)}>
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingField?.id ? "Modifier le champ" : "Ajouter un nouveau champ"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="label">Label (Affiché au client)</Label>
              <Input
                id="label"
                value={editingField?.label || ''}
                onChange={(e) => setEditingField(prev => ({ ...prev, label: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={editingField?.placeholder || ''}
                onChange={(e) => setEditingField(prev => ({ ...prev, placeholder: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="field_type">Type de champ</Label>
              <Select
                value={editingField?.field_type || 'text'}
                onValueChange={(value) => setEditingField(prev => ({ ...prev, field_type: value as FormField['field_type'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texte court</SelectItem>
                  <SelectItem value="tel">Téléphone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="textarea">Zone de texte</SelectItem>
                  <SelectItem value="select">Sélection (Dropdown)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {editingField?.field_type === 'select' && (
              <div>
                <Label htmlFor="options">Options (JSON format: {"{\"option1\": \"value1\", \"option2\": \"value2\"}"})</Label>
                <Textarea
                  id="options"
                  value={JSON.stringify(editingField?.options || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      setEditingField(prev => ({ ...prev, options: JSON.parse(e.target.value) }));
                    } catch {
                      // Ignore invalid JSON input temporarily
                    }
                  }}
                />
              </div>
            )}

            <div>
              <Label htmlFor="icon_name">Icône (Lucide React)</Label>
              <Select
                value={editingField?.icon_name || 'User'}
                onValueChange={(value) => setEditingField(prev => ({ ...prev, icon_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'icône" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(icon => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_required"
                checked={editingField?.is_required || false}
                onCheckedChange={(checked) => setEditingField(prev => ({ ...prev, is_required: checked === true }))}
              />
              <Label htmlFor="is_required">Champ obligatoire</Label>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderFormSettings;