import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f1eee9" }}>
      <PromoBar />
      <Navbar />
      <main className="flex-grow">
        <iframe
          src="https://form.jotform.com/250352168880560"
          className="w-full h-full min-h-[80vh] border-none"
          title="Contact Form"
        />
      </main>
      <Footer />
    </div>
  );
};

export default Contact;