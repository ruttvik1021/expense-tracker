import { Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CustomDeleteIcon = ({
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
            className="fill-destructive rounded-full icon border"
          />
        </TooltipTrigger>
        <TooltipContent className="bg-red-400 text-black">
          <p>{tooltip || "Delete"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomDeleteIcon;
