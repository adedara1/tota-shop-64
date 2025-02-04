import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Generate a wide range of colors
const generateColors = () => {
  const colors = [];
  // Add the default color first
  colors.push("#f1eee9");
  
  // Generate colors across the RGB spectrum
  for (let r = 0; r <= 255; r += 51) {
    for (let g = 0; g <= 255; g += 51) {
      for (let b = 0; b <= 255; b += 51) {
        const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        if (color !== "#f1eee9") { // Skip default color as it's already added
          colors.push(color);
        }
      }
    }
  }
  return colors;
};

interface ColorSelectorProps {
  colors?: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorSelector = ({ selectedColor, onColorSelect }: ColorSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [colors] = useState(generateColors);

  const filteredColors = searchQuery
    ? colors.filter(color => 
        color.toLowerCase().startsWith(searchQuery.toLowerCase())
      )
    : colors;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Couleur du thème</Label>
        <div className="w-64">
          <Input
            type="text"
            placeholder="Rechercher un code couleur (#...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="w-full">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {filteredColors.map((color, index) => (
              <CarouselItem key={index} className="pl-2 basis-1/6 sm:basis-1/8 md:basis-1/10">
                <button
                  onClick={() => onColorSelect(color)}
                  className={cn(
                    "w-full aspect-square rounded-lg border-2 transition-all",
                    selectedColor === color ? "border-black scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default ColorSelector;