
type PromoBarProps = {
  text?: string;
};

const PromoBar = ({ text = "Livraison GRATUITE et Paiement à la livraison !" }: PromoBarProps) => {
  return (
    <div className="w-full bg-promo text-white text-center py-2 text-sm">
      {text}
    </div>
  );
};

export default PromoBar;
