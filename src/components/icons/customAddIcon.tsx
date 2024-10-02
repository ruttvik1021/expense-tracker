"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Circle, PlusCircleIcon } from "lucide-react";
import { useAuthContext } from "../wrapper/ContextWrapper";

const CustomAddIcon = ({
  onClick,
  tooltip,
}: {
  onClick: () => void;
  tooltip?: string;
}) => {
  const { isIconPreferred } = useAuthContext();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {isIconPreferred ? (
            <PlusCircleIcon onClick={onClick} className="icon" />
          ) : (
            <Circle
              onClick={onClick}
              className="fill-green-600 rounded-full icon border"
            />
          )}
        </TooltipTrigger>
        <TooltipContent className="bg-green-200 text-black">
          <p>{tooltip || "Add"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomAddIcon;
