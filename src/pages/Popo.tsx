
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PopoSettings {
  title1: string;
  title2: string;
  button1_text: string;
  button2_text: string;
  button1_url: string;
  button2_url: string;
}

const Popo = () => {
  const [settings, setSettings] = useState<PopoSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("popo_settings")
        .select("*")
        .single();

      if (!error && data) {
        setSettings(data);
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
