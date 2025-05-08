
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Upload, Image, Film, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MediaUploaderProps {
  onMediaUpload: (url: string, type: "image" | "video") => void;
  initialMedia?: { url: string; type: "image" | "video" };
  className?: string;
  onShowMediaChange?: (showMedia: boolean) => void;
  showMedia?: boolean;
}

// Fonction pour sanitizer les noms de fichiers
const sanitizeFileName = (fileName: string): string => {
  // Remplacer les caractères accentués et spéciaux
  return fileName
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-zA-Z0-9.-]/g, '_'); // Remplace autres caractères spéciaux par _
};

const MediaUploader = ({ onMediaUpload, initialMedia, className, onShowMediaChange, showMedia = true }: MediaUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialMedia?.url || null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(initialMedia?.type || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      toast.error("Veuillez sélectionner une image ou une vidéo");
      return;
    }
    
    // Taille max de 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier doit être inférieur à 5MB");
      return;
    }

    setIsUploading(true);
    
    try {
      // Créer une URL pour la prévisualisation
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setMediaType(isImage ? "image" : "video");
      
      // Uploader le fichier à Supabase Storage
      const fileExt = file.name.split('.').pop();
      const sanitizedName = sanitizeFileName(file.name);
      const fileName = `${crypto.randomUUID()}-${Date.now()}.${fileExt}`;
      
      const { error, data } = await supabase.storage
        .from('store_media')
        .upload(fileName, file);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('store_media')
        .getPublicUrl(fileName);
      
      // Appeler la fonction de callback avec l'URL publique
      onMediaUpload(publicUrl, isImage ? "image" : "video");
      
      toast.success("Média uploadé avec succès");
    } catch (error) {
      console.error("Erreur lors du upload:", error);
      toast.error("Erreur lors du upload du fichier");
      setPreview(null);
      setMediaType(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onMediaUpload("", mediaType || "image");
  };

  const handleShowMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onShowMediaChange) {
      onShowMediaChange(e.target.checked);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-medium">Image ou vidéo de la boutique</h3>
          <p className="text-xs text-gray-500">Format recommandé: 16:9, max 5MB</p>
        </div>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="show-media"
            checked={showMedia}
            onChange={handleShowMediaChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="show-media" className="ml-2 text-sm">
            Afficher le média
          </label>
        </div>
      </div>
      
      {showMedia && (
        <>
          {preview ? (
            <div className="relative">
              <div className="aspect-video w-full overflow-hidden bg-gray-100 rounded-md">
                {mediaType === "image" ? (
                  <img 
                    src={preview} 
                    alt="Aperçu" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video 
                    src={preview} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <button 
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-2">
                  <Upload className="h-6 w-6 text-gray-400 mr-2" />
                  <Image className="h-6 w-6 text-gray-400 mr-1" />
                  <span className="text-gray-400">/</span>
                  <Film className="h-6 w-6 text-gray-400 ml-1" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Glissez-déposez ou cliquez pour uploader</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? "Upload en cours..." : "Sélectionner un fichier"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaUploader;
