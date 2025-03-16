
import React, { useState } from 'react';
import { Toggle, toggleVariants } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface ProductOptionsProps {
  title: string;
  options: string[];
  onSelect: (option: string) => void;
  selectedOption?: string;
}

const ProductOptions = ({
  title,
  options,
  onSelect,
  selectedOption
}: ProductOptionsProps) => {
  // If no option is selected, default to the first one
  const [selected, setSelected] = useState<string>(
    selectedOption || (options.length > 0 ? options[0] : "")
  );

  const handleSelect = (option: string) => {
    setSelected(option);
    onSelect(option);
  };

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Toggle
            key={option}
            pressed={selected === option}
            onPressedChange={() => handleSelect(option)}
            className={cn(
              "rounded-full px-4 py-2 text-sm border",
              selected === option
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            )}
          >
            {option}
          </Toggle>
        ))}
      </div>
    </div>
  );
};

export default ProductOptions;
