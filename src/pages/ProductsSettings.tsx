
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSettingsType } from "@/models/products-page-settings";
import Navbar from "@/components/Navbar";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";

const ProductsSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PageSettingsType | null>(null);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [mobileHeroImage, setMobileHeroImage] = useState<File | null>(null);
  const [bannerMessage, setBannerMessage] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("page_settings")
        .select()
        .eq("id", "products")
        .single();

      if (error) throw error;
      setSettings(data);
      setBannerMessage(data.banner_message || "");
      setShowBanner(data.show_banner);
      setDescription(data.description || "");
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive",
      });
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImage(e.target.files[0]);
    }
  };

  const handleMobileHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMobileHeroImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      let heroImageUrl = settings?.hero_image || "";
      let mobileHeroImageUrl = settings?.mobile_hero_image || "";

      // Upload hero image if changed
      if (heroImage) {
        const fileName = `hero_${Date.now()}_${heroImage.name}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, heroImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);

        heroImageUrl = publicUrl;
      }

      // Upload mobile hero image if changed
      if (mobileHeroImage) {
        const fileName = `mobile_hero_${Date.now()}_${mobileHeroImage.name}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, mobileHeroImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);

        mobileHeroImageUrl = publicUrl;
      }

      const updatedSettings = {
        title: formData.get("title") as string,
        hero_image: heroImageUrl,
        mobile_hero_image: mobileHeroImageUrl,
        banner_message: bannerMessage,
        show_banner: showBanner,
        description: description,
      };

      const { error: updateError } = await supabase
        .from("page_settings")
        .update(updatedSettings)
        .eq("id", "products");

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: "Paramètres mis à jour avec succès",
      });
      
      fetchSettings();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-medium mb-6">Paramètres de la page produits</h1>

        <Tabs defaultValue="hero">
          <TabsList>
            <TabsTrigger value="hero">Bannière Héro</TabsTrigger>
            <TabsTrigger value="promo">Bannière Promo</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="p-4 border rounded-lg mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Titre de la page</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={settings.title}
                  placeholder="Titre de la page"
                />
              </div>

              <div>
                <Label htmlFor="hero_image">Image de bannière (Desktop : 1920px × 600px)</Label>
                <div className="mt-2 mb-4">
                  {settings.hero_image && (
                    <img
                      src={settings.hero_image}
                      alt="Bannière actuelle"
                      className="max-h-48 rounded-md mb-2"
                    />
                  )}
                </div>
                <Input
                  id="hero_image"
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageChange}
                />
              </div>

              <div>
                <Label htmlFor="mobile_hero_image">Image de bannière mobile (768px × 500px)</Label>
                <div className="mt-2 mb-4">
                  {settings.mobile_hero_image && (
                    <img
                      src={settings.mobile_hero_image}
                      alt="Bannière mobile actuelle"
                      className="max-h-48 rounded-md mb-2"
                    />
                  )}
                </div>
                <Input
                  id="mobile_hero_image"
                  type="file"
                  accept="image/*"
                  onChange={handleMobileHeroImageChange}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "En cours..." : "Enregistrer"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="promo" className="p-4 border rounded-lg mt-4">
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Label htmlFor="show_banner">Afficher la bannière</Label>
                  <input
                    id="show_banner"
                    type="checkbox"
                    checked={showBanner}
                    onChange={(e) => setShowBanner(e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <Textarea
                  id="banner_message"
                  value={bannerMessage}
                  onChange={(e) => setBannerMessage(e.target.value)}
                  placeholder="Message promotionnel"
                />
              </div>

              <Button disabled={loading} onClick={async () => {
                setLoading(true);
                try {
                  const { error } = await supabase
                    .from("page_settings")
                    .update({
                      show_banner: showBanner,
                      banner_message: bannerMessage,
                    })
                    .eq("id", "products");

                  if (error) throw error;

                  toast({
                    title: "Succès",
                    description: "Bannière mise à jour avec succès",
                  });
                } catch (error) {
                  console.error("Error updating banner:", error);
                  toast({
                    title: "Erreur",
                    description: "Impossible de mettre à jour la bannière",
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              }}>
                {loading ? "En cours..." : "Enregistrer"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="description" className="p-4 border rounded-lg mt-4">
            <div className="space-y-6">
              <div>
                <Label htmlFor="description">Description de la page</Label>
                <div className="mt-2">
                  <RichTextEditor value={description} onChange={setDescription} />
                </div>
              </div>

              <Button disabled={loading} onClick={async () => {
                setLoading(true);
                try {
                  const { error } = await supabase
                    .from("page_settings")
                    .update({
                      description,
                    })
                    .eq("id", "products");

                  if (error) throw error;

                  toast({
                    title: "Succès",
                    description: "Description mise à jour avec succès",
                  });
                } catch (error) {
                  console.error("Error updating description:", error);
                  toast({
                    title: "Erreur",
                    description: "Impossible de mettre à jour la description",
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              }}>
                {loading ? "En cours..." : "Enregistrer"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductsSettings;
