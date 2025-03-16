
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";

interface ProductOptionsProps {
  title: string;
  options: string[];
  onChange?: (value: string) => void;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({ 
  title, 
  options,
  onChange
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(options[0] || '');

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      
      <ToggleGroup 
        type="single" 
        value={selectedOption}
        onValueChange={(value) => {
          if (value) handleOptionChange(value);
        }}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className="border border-gray-300 py-2 px-4 rounded data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:border-black"
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default ProductOptions;
