
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";

type PopoSettings = Database['public']['Tables']['popo_settings']['Row'];

const Popo = () => {
  const [settings, setSettings] = useState<PopoSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("popo_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setSettings(data);
      } else {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleButtonClick = (url: string) => {
    navigate("/formulaire", { state: { url } });
  };

  if (!settings) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="border p-6 rounded-lg shadow-sm">
        <h3 className="text-2xl font-semibold mb-4">{settings.title1}</h3>
        <button
          onClick={() => handleButtonClick(settings.button1_url)}
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          {settings.button1_text}
        </button>
      </div>

      <div className="border p-6 rounded-lg shadow-sm">
        <h3 className="text-2xl font-semibold mb-4">{settings.title2}</h3>
        <button
          onClick={() => handleButtonClick(settings.button2_url)}
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          {settings.button2_text}
        </button>
      </div>
    </div>
  );
};

export default Popo;
