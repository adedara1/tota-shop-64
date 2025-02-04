import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorSelector = ({ colors, selectedColor, onColorSelect }: ColorSelectorProps) => {
  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {colors.map((color, index) => (
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
  );
};

export default ColorSelector;