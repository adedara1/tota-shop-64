
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash, Edit, ToggleLeft, ToggleRight } from "lucide-react";

interface WhatsAppRedirect {
  id: string;
  name: string;
  url_name: string;
  redirect_code: string;
  redirect_url: string;
  wait_minutes: number; // Stocke directement les secondes
  is_active: boolean;
  created_at: string;
}

const WhatsAppRedirect = () => {
  const [name, setName] = useState('');
  const [urlName, setUrlName] = useState('');
  const [redirectCode, setRedirectCode] = useState('');
  const [waitSeconds, setWaitSeconds] = useState<number>(0);
  const [redirects, setRedirects] = useState<WhatsAppRedirect[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Charger les redirections existantes
  const fetchRedirects = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_redirects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRedirects(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des redirections: ${error.message}`);
      console.error("Erreur fetchRedirects:", error);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  // Générer un URL name à partir du nom
  const generateUrlName = (inputName: string) => {
    return inputName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  // Mettre à jour l'URL name quand le nom change
  useEffect(() => {
    if (!editingId || !urlName.trim()) {
      setUrlName(generateUrlName(name));
    }
  }, [name, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation: s'assurer que tous les champs requis sont présents
      if (!name.trim()) {
        throw new Error("Le nom est requis");
      }
      
      if (!urlName.trim()) {
        throw new Error("Le nom d'URL est requis");
      }
      
      if (!redirectCode.trim()) {
        throw new Error("Le code de redirection est requis");
      }

      // Vérifier si le code est une URL d'intention ou un numéro de téléphone
      let finalRedirectUrl = redirectCode;
      
      // Si c'est juste un numéro de téléphone, créer une URL d'intention
      if (/^\d+$/.test(redirectCode)) {
        finalRedirectUrl = `intent://send?phone=${redirectCode}#Intent;scheme=whatsapp;package=com.whatsapp;action=android.intent.action.VIEW;end;`;
      }

      console.log("Vérification de l'URL name unique:", urlName);
      // Vérifier si l'URL name est unique
      const { data: existingWithSameUrlName, error: checkError } = await supabase
        .from('whatsapp_redirects')
        .select('id')
        .eq('url_name', urlName);
      
      if (checkError) {
        console.error("Erreur lors de la vérification de l'URL name:", checkError);
        throw checkError;
      }
      
      // Filtrer pour exclure l'ID actuel en cours d'édition
      const duplicates = existingWithSameUrlName?.filter(item => editingId ? item.id !== editingId : true) || [];
      
      if (duplicates.length > 0) {
        toast.error("Ce nom d'URL est déjà utilisé. Veuillez en choisir un autre.");
        setLoading(false);
        return;
      }

      console.log("Préparation des données pour", editingId ? "mise à jour" : "insertion");
      
      const redirectData = {
        name,
        url_name: urlName,
        redirect_code: redirectCode,
        redirect_url: finalRedirectUrl,
        wait_minutes: waitSeconds // Secondes directement
      };
      
      console.log("Données à envoyer:", redirectData);

      if (editingId) {
        // Mettre à jour une redirection existante
        console.log("Mise à jour de la redirection avec ID:", editingId);
        const { error } = await supabase
          .from('whatsapp_redirects')
          .update(redirectData)
          .eq('id', editingId);
        
        if (error) {
          console.error("Erreur lors de la mise à jour:", error);
          throw error;
        }
        
        toast.success('Redirection mise à jour avec succès');
        setEditingId(null);
      } else {
        // Créer une nouvelle redirection
        console.log("Création d'une nouvelle redirection");
        const { error } = await supabase
          .from('whatsapp_redirects')
          .insert(redirectData);
        
        if (error) {
          console.error("Erreur lors de l'insertion:", error);
          throw error;
        }
        
        toast.success('Redirection créée avec succès');
      }
      
      // Réinitialiser le formulaire et rafraîchir la liste
      setName('');
      setUrlName('');
      setRedirectCode('');
      setWaitSeconds(0);
      fetchRedirects();
    } catch (error: any) {
      console.error("Erreur dans handleSubmit:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (redirect: WhatsAppRedirect) => {
    console.log("Édition de la redirection:", redirect);
    setEditingId(redirect.id);
    setName(redirect.name);
    setUrlName(redirect.url_name || generateUrlName(redirect.name));
    setRedirectCode(redirect.redirect_code);
    setWaitSeconds(redirect.wait_minutes);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette redirection?')) {
      try {
        console.log("Suppression de la redirection avec ID:", id);
        const { error } = await supabase
          .from('whatsapp_redirects')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error("Erreur lors de la suppression:", error);
          throw error;
        }
        
        toast.success('Redirection supprimée avec succès');
        fetchRedirects();
      } catch (error: any) {
        console.error("Erreur dans handleDelete:", error);
        toast.error(`Erreur: ${error.message}`);
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      console.log(`${currentStatus ? 'Désactivation' : 'Activation'} de la redirection avec ID:`, id);
      const { error } = await supabase
        .from('whatsapp_redirects')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) {
        console.error("Erreur lors du changement de statut:", error);
        throw error;
      }
      
      toast.success(`Redirection ${currentStatus ? 'désactivée' : 'activée'} avec succès`);
      fetchRedirects();
    } catch (error: any) {
      console.error("Erreur dans toggleActive:", error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const cancelEdit = () => {
    console.log("Annulation de l'édition");
    setEditingId(null);
    setName('');
    setUrlName('');
    setRedirectCode('');
    setWaitSeconds(0);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Redirections WhatsApp</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Modifier une redirection' : 'Créer une nouvelle redirection'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la redirection</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Support Client"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="urlName">Nom dans l'URL</Label>
            <Input
              id="urlName"
              type="text"
              value={urlName}
              onChange={(e) => setUrlName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="Ex: support-client"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Ce nom sera utilisé dans l'URL: /whatsapp/<span className="font-mono">{urlName || 'nom-url'}</span>
            </p>
          </div>
          
          <div>
            <Label htmlFor="redirectCode">
              Code WhatsApp ou URL d'intention
              <span className="block text-sm text-gray-500 mt-1">
                Vous pouvez saisir un numéro de téléphone (ex: 51180895) ou une URL d'intention complète.
              </span>
            </Label>
            <Textarea
              id="redirectCode"
              value={redirectCode}
              onChange={(e) => setRedirectCode(e.target.value)}
              placeholder="Ex: 51180895 ou intent://send?phone=51180895&text=Bonjour#Intent;scheme=whatsapp;package=com.whatsapp;action=android.intent.action.VIEW;end;"
              required
              className="h-24"
            />
          </div>
          
          <div>
            <Label htmlFor="waitSeconds">Temps d'attente avant redirection (en secondes)</Label>
            <Input
              id="waitSeconds"
              type="number"
              min="0"
              max="3600"
              value={waitSeconds}
              onChange={(e) => setWaitSeconds(parseInt(e.target.value) || 0)}
              required
            />
          </div>
          
          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={loading}>
              {editingId ? 'Mettre à jour' : 'Créer la redirection'}
            </Button>
            
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Redirections existantes</h2>
        
        {redirects.length === 0 ? (
          <p className="text-gray-500">Aucune redirection n'a été créée.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Nom URL</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Attente</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead>Lien</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirects.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell>{redirect.name}</TableCell>
                    <TableCell>{redirect.url_name || generateUrlName(redirect.name)}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{redirect.redirect_code}</TableCell>
                    <TableCell>{redirect.wait_minutes} sec</TableCell>
                    <TableCell>
                      {redirect.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactif
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(redirect.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Link 
                        to={`/whatsapp/${redirect.url_name || redirect.id}`} 
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Ouvrir
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(redirect)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleActive(redirect.id, redirect.is_active)}
                          title={redirect.is_active ? "Désactiver" : "Activer"}
                        >
                          {redirect.is_active ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(redirect.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppRedirect;
