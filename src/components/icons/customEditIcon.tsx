import { Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CustomEditIcon = ({
  onClick,
  tooltip,
}: {
  onClick: () => void;
  tooltip?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Circle
            onClick={onClick}
            className="fill-yellow-600 rounded-full icon border"
          />
        </TooltipTrigger>
        <TooltipContent className="bg-yellow-400 text-black">
          <p>{tooltip || "Edit"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomEditIcon;
