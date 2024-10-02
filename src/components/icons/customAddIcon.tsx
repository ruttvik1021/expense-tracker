import { Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CustomAddIcon = ({
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
            className="fill-green-600 rounded-full icon border"
          />
        </TooltipTrigger>
        <TooltipContent className="bg-green-200 text-black">
          <p>{tooltip || "Add"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomAddIcon;
