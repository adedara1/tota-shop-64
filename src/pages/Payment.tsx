import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const cartUrl = searchParams.get("cartUrl");

  if (!cartUrl) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f1eee9" }}>
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">URL de paiement non valide</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f1eee9" }}>
      <PromoBar />
      <Navbar />
      <main className="flex-grow">
        <iframe
          src={cartUrl}
          className="w-full h-full min-h-[80vh] border-none"
          title="Paiement"
        />
      </main>
      <Footer />
    </div>
  );
};

export default Payment;