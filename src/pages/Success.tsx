import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PromoBar from '@/components/PromoBar';

const Success = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PromoBar />
      <Navbar />
      <main className="flex-grow container mx-auto py-12 px-4 flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl max-w-lg w-full text-center border-t-4 border-green-500">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4 text-gray-800">COMMANDE REÇUE</h1>
          <p className="text-lg text-gray-600 mb-8">
            Nous avons bien reçu votre commande. Un de nos collaborateurs vous appellera pour avoir votre confirmation.
          </p>
          <Link to="/products">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Continuer mes achats
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Success;