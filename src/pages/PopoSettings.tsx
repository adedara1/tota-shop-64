
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type PopoSettings = Omit<Database['public']['Tables']['popo_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;

const PopoSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settingId, setSettingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PopoSettings>({
    title1: "",
    title2: "",
    button1_text: "",
    button2_text: "",
    button1_url: "",
    button2_url: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("popo_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const { id, created_at, updated_at, ...settings } = data;
        setSettingId(id);
        setFormData(settings);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!settingId) {
        throw new Error("No setting ID found");
      }

      const { error } = await supabase
        .from("popo_settings")
        .update(formData)
        .eq('id', settingId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Les paramètres ont été enregistrés",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les paramètres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <Label htmlFor="title1">Titre du premier div</Label>
        <Input
          id="title1"
          name="title1"
          value={formData.title1}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="title2">Titre du deuxième div</Label>
        <Input
          id="title2"
          name="title2"
          value={formData.title2}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="button1_text">Texte du premier bouton</Label>
        <Input
          id="button1_text"
          name="button1_text"
          value={formData.button1_text}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="button2_text">Texte du deuxième bouton</Label>
        <Input
          id="button2_text"
          name="button2_text"
          value={formData.button2_text}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="button1_url">URL du premier bouton</Label>
        <Input
          id="button1_url"
          name="button1_url"
          type="url"
          value={formData.button1_url}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="button2_url">URL du deuxième bouton</Label>
        <Input
          id="button2_url"
          name="button2_url"
          type="url"
          value={formData.button2_url}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
};

export default PopoSettings;
