
import React, { useState, useEffect } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

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
              "rounded-full px-4 py-2 text-sm border",
              selected === option.value
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            )}
          >
            {option.value}
          </Toggle>
        ))}
      </div>
    </div>
  );
};

export default ProductOptions;
