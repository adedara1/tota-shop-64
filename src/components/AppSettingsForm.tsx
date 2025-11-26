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

const BRANDING_KEY = "app_branding";
const PIXEL_KEY = "meta_pixel_config";
const DEFAULT_APP_NAME = "Digit-Sarl";

const formSchema = z.object({
  appName: z.string().min(1, "Le nom de l'application est requis"),
  metaPixelId: z.string().optional(),
});

type AppSettingsFormValues = z.infer<typeof formSchema>;

// Hook pour charger les paramètres de l'application
export const useAppBranding = () => {
  return useQuery({
    queryKey: [BRANDING_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", BRANDING_KEY)
        .maybeSingle();

      if (error) {
        console.error("Error fetching app branding settings:", error);
        return { appName: DEFAULT_APP_NAME };
      }

      const appName = (data?.setting_value as { appName: string })?.appName || DEFAULT_APP_NAME;
      return { appName };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook pour charger la configuration du Meta Pixel
export const useMetaPixelConfig = () => {
  return useQuery({
    queryKey: [PIXEL_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", PIXEL_KEY)
        .maybeSingle();

      if (error) {
        console.error("Error fetching meta pixel settings:", error);
        return { metaPixelId: "" };
      }

      const metaPixelId = (data?.setting_value as { metaPixelId: string })?.metaPixelId || "";
      return { metaPixelId };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook pour mettre à jour les paramètres de l'application
const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: AppSettingsFormValues) => {
      const updates = [
        { key: BRANDING_KEY, value: { appName: values.appName } },
        { key: PIXEL_KEY, value: { metaPixelId: values.metaPixelId || "" } },
      ];

      for (const { key, value } of updates) {
        const { data: existingData } = await supabase
          .from("app_settings")
          .select("id")
          .eq("setting_key", key)
          .maybeSingle();

        if (existingData) {
          // Update existing setting
          const { error } = await supabase
            .from("app_settings")
            .update({ setting_value: value })
            .eq("setting_key", key);
          
          if (error) throw error;
        } else {
          // Insert new setting
          const { error } = await supabase
            .from("app_settings")
            .insert({ setting_key: key, setting_value: value });
          
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BRANDING_KEY] });
      queryClient.invalidateQueries({ queryKey: [PIXEL_KEY] });
      toast({
        title: "Succès",
        description: "Les paramètres de l'application ont été mis à jour.",
      });
    },
    onError: (error) => {
      console.error("Error updating app settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres de l'application.",
        variant: "destructive",
      });
    },
  });
};

const AppSettingsForm = () => {
  const { data: brandingData, isLoading: isLoadingBranding } = useAppBranding();
  const { data: pixelData, isLoading: isLoadingPixel } = useMetaPixelConfig();
  const { mutate: updateSettings, isPending } = useUpdateAppSettings();

  const isLoading = isLoadingBranding || isLoadingPixel;

  const form = useForm<AppSettingsFormValues>({
    resolver: zodResolver(formSchema),
    values: {
      appName: brandingData?.appName || DEFAULT_APP_NAME,
      metaPixelId: pixelData?.metaPixelId || "",
    },
    resetOptions: {
      keepDirtyValues: true,
    }
  });

  const onSubmit = (values: AppSettingsFormValues) => {
    updateSettings(values);
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
        <CardTitle>Paramètres de l'application</CardTitle>
        <p className="text-sm text-gray-500">Configurez les paramètres globaux de votre boutique.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          
          <div className="space-y-2">
            <Label htmlFor="metaPixelId">ID du Meta Pixel (Facebook)</Label>
            <Input
              id="metaPixelId"
              {...form.register("metaPixelId")}
              placeholder="Ex: 123456789012345"
            />
            <p className="text-sm text-gray-500">
              Entrez votre ID de Pixel pour suivre les événements de conversion.
            </p>
          </div>
          
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Sauvegarde..." : "Sauvegarder les paramètres"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppSettingsForm;