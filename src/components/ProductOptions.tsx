
import React, { useState, useEffect } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface OptionValue {
  value: string;
  image?: string;
}

interface ProductOptionsProps {
  title: string;
  options: (string | OptionValue)[];
  onSelect: (option: string | OptionValue) => void;
  selectedOption?: string;
}

const ProductOptions = ({
  title,
  options,
  onSelect,
  selectedOption
}: ProductOptionsProps) => {
  // Handle both string options and option objects with images
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt } : opt
  );
  
  // If no option is selected, default to the first one
  const [selected, setSelected] = useState<string>(
    selectedOption || (normalizedOptions.length > 0 ? normalizedOptions[0].value : "")
  );

  useEffect(() => {
    if (selectedOption) {
      setSelected(selectedOption);
    }
  }, [selectedOption]);

  const handleSelect = (option: OptionValue) => {
    setSelected(option.value);
    onSelect(option);
  };

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {normalizedOptions.map((option) => (
          <Toggle
            key={option.value}
            pressed={selected === option.value}
            onPressedChange={() => handleSelect(option)}
            className={cn(
              "rounded-full px-4 py-2 text-sm border flex items-center",
              selected === option.value
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            )}
          >
            {option.value}
            {option.image && (
              <span className="ml-2">
                <ImageIcon size={16} />
              </span>
            )}
          </Toggle>
        ))}
      </div>
      
      {/* Option images displayed as circular buttons */}
      {normalizedOptions.some(opt => opt.image) && (
        <div className="flex flex-wrap gap-3 mt-3">
          {normalizedOptions
            .filter(opt => opt.image)
            .map((option, idx) => (
              <button
                key={`img-${idx}-${option.value}`}
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-14 h-14 rounded-full overflow-hidden border-2 transition-all",
                  selected === option.value 
                    ? "border-black scale-110" 
                    : "border-gray-200 hover:border-gray-400"
                )}
                title={option.value}
              >
                <img 
                  src={option.image} 
                  alt={option.value}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductOptions;
