import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save } from "lucide-react";

const SETTING_KEY = "app_branding";
const DEFAULT_APP_NAME = "Digit-Sarl";

const formSchema = z.object({
  appName: z.string().min(1, "Le nom de l'application est requis"),
});

type AppSettingsFormValues = z.infer<typeof formSchema>;

// Hook pour charger les paramètres de l'application
export const useAppBranding = () => {
  return useQuery({
    queryKey: [SETTING_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", SETTING_KEY)
        .maybeSingle();

      if (error) {
        console.error("Error fetching app settings:", error);
        // Fallback to default if error occurs
        return { appName: DEFAULT_APP_NAME };
      }

      const appName = (data?.setting_value as { appName: string })?.appName || DEFAULT_APP_NAME;
      return { appName };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook pour mettre à jour les paramètres de l'application
const useUpdateAppBranding = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newAppName: string) => {
      const settingValue = { appName: newAppName };
      
      // Check if the setting exists to decide between insert or update
      const { data: existingData } = await supabase
        .from("app_settings")
        .select("id")
        .eq("setting_key", SETTING_KEY)
        .maybeSingle();

      if (existingData) {
        // Update existing setting
        const { error } = await supabase
          .from("app_settings")
          .update({ setting_value: settingValue })
          .eq("setting_key", SETTING_KEY);
        
        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from("app_settings")
          .insert({ setting_key: SETTING_KEY, setting_value: settingValue });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTING_KEY] });
      toast({
        title: "Succès",
        description: "Le nom de l'application a été mis à jour.",
      });
    },
    onError: (error) => {
      console.error("Error updating app name:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le nom de l'application.",
        variant: "destructive",
      });
    },
  });
};

const AppSettingsForm = () => {
  const { data, isLoading } = useAppBranding();
  const { mutate: updateBranding, isPending } = useUpdateAppBranding();

  const form = useForm<AppSettingsFormValues>({
    resolver: zodResolver(formSchema),
    values: {
      appName: data?.appName || DEFAULT_APP_NAME,
    },
    // Reset values when data loads
    resetOptions: {
      keepDirtyValues: true,
    }
  });

  const onSubmit = (values: AppSettingsFormValues) => {
    updateBranding(values.appName);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement des paramètres...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nom de l'application</CardTitle>
        <p className="text-sm text-gray-500">Ce nom sera affiché dans l'en-tête, le pied de page et le titre du site.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Nom de l'application</Label>
            <Input
              id="appName"
              {...form.register("appName")}
              placeholder={DEFAULT_APP_NAME}
            />
            {form.formState.errors.appName && (
              <p className="text-sm text-red-500">{form.formState.errors.appName.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Sauvegarde..." : "Sauvegarder le nom"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppSettingsForm;