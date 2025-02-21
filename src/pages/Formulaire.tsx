
import { useLocation } from "react-router-dom";

const Formulaire = () => {
  const location = useLocation();
  const { url } = location.state || {};

  if (!url) return <div>Aucune URL fournie</div>;

  return (
    <div className="min-h-screen">
      <iframe
        src={url}
        className="w-full h-screen border-0"
        title="Formulaire"
      />
    </div>
  );
};

export default Formulaire;
