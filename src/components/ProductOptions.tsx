import { useState, useEffect } from "react";

interface OptionValue {
  value: string;
  image?: string;
}

interface ProductOptionsProps {
  title: string;
  options: (string | OptionValue)[];
  onSelect: (value: string | OptionValue) => void;
  selectedOption?: string;
  titleColor?: string;
  valueColor?: string;
}

const ProductOptions = ({ 
  title, 
  options, 
  onSelect, 
  selectedOption,
  titleColor = "#000000",
  valueColor = "#000000"
}: ProductOptionsProps) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(selectedOption || null);
  
  useEffect(() => {
    if (selectedOption) {
      setSelectedValue(selectedOption);
      return;
    }
    
    if (options.length > 0 && selectedValue === null) {
      const firstOption = options[0];
      const value = typeof firstOption === 'object' ? firstOption.value : firstOption;
      setSelectedValue(value);
      onSelect(firstOption);
    }
  }, [selectedOption, options]);
  
  const handleSelect = (option: string | OptionValue) => {
    const value = typeof option === 'object' ? option.value : option;
    setSelectedValue(value);
    onSelect(option);
    
    console.log(`Selected option in ProductOptions:`, { 
      option, 
      title, 
      value,
      selectedValue: value
    });
  };
  
  const uniqueOptions = options.filter((option, index, self) => {
    const value = typeof option === 'object' ? option.value : option;
    return index === self.findIndex(o => {
      const oValue = typeof o === 'object' ? o.value : o;
      return oValue === value;
    });
  });
  
  const hasImages = options.some(option => typeof option === 'object' && option.image);
  
  if (uniqueOptions.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3" style={{ color: titleColor }}>{title}</h3>
      
      <div className={`flex flex-wrap gap-2 ${hasImages ? 'items-start' : 'items-center'}`}>
        {uniqueOptions.map((option, index) => {
          const value = typeof option === 'object' ? option.value : option;
          const image = typeof option === 'object' ? option.image : undefined;
          
          if (image) {
            return (
              <button
                key={`${value}-${index}`}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  p-1 border rounded-md overflow-hidden flex flex-col items-center justify-center
                  ${selectedValue === value 
                    ? 'border-black' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
                title={value}
              >
                <div className="w-16 h-16 overflow-hidden mb-1">
                  <img 
                    src={image} 
                    alt={value} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span 
                  className="text-xs text-center block w-full px-1" 
                  style={{ color: valueColor }}
                >
                  {value}
                </span>
              </button>
            );
          }
          
          return (
            <button
              key={`${value}-${index}`}
              type="button"
              onClick={() => handleSelect(option)}
              className={`
                px-4 py-2 rounded-full
                ${selectedValue === value 
                  ? 'bg-black text-white' 
                  : 'bg-white border border-gray-300 hover:border-gray-400'
                }
              `}
              style={selectedValue !== value ? { color: valueColor } : {}}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductOptions;
