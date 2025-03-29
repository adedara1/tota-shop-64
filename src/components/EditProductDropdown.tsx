
import { useNavigate } from "react-router-dom";
import { MoreVertical, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditProductDropdownProps {
  productId: string;
  onEdit: () => void;
}

const EditProductDropdown = ({ productId, onEdit }: EditProductDropdownProps) => {
  const navigate = useNavigate();

  const handlePreview = () => {
    // Navigate to the preview page instead of the product detail page
    navigate(`/product-preview/${productId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          <span>Modifier</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePreview} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          <span>Aperçu</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EditProductDropdown;
