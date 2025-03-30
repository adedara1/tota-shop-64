
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  defaultColor?: string;
}

const ColorInput = ({ label, value, onChange, defaultColor = "#000000" }: ColorInputProps) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const presetColors = [
    "#000000", // Black
    "#FFFFFF", // White
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#808080", // Gray
  ];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div 
          className="w-10 h-10 rounded border cursor-pointer" 
          style={{ backgroundColor: value || defaultColor }}
          onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
        />
        <Input
          type="text"
          value={value || defaultColor}
          onChange={(e) => onChange(e.target.value)}
          className="w-32"
        />
        <Input
          type="color"
          value={value || defaultColor}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 p-1"
        />
      </div>
      
      {isColorPickerOpen && (
        <div className="flex flex-wrap gap-2 mt-2">
          {presetColors.map((color) => (
            <Button
              key={color}
              type="button"
              className="w-8 h-8 p-0 rounded-md"
              style={{ backgroundColor: color }}
              onClick={() => {
                onChange(color);
                setIsColorPickerOpen(false);
              }}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={() => {
              onChange(defaultColor);
              setIsColorPickerOpen(false);
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  );
};

export default ColorInput;
