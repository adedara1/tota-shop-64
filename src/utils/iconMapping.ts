import { User, Phone, MapPin, Calendar, Mail, Home, Info, Plus, Minus, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  User,
  Phone,
  MapPin,
  Calendar,
  Mail,
  Home,
  Info,
  Plus,
  Minus,
};

export const getIconComponent = (iconName: string | null): LucideIcon => {
  if (iconName && iconMap[iconName]) {
    return iconMap[iconName];
  }
  return Info; // Default icon
};