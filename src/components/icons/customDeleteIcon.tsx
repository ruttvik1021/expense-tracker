"use client";
import { Circle, Trash2Icon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthContext } from "../wrapper/ContextWrapper";

const CustomDeleteIcon = ({
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
            <Trash2Icon onClick={onClick} className="icon" />
          ) : (
            <Circle
              onClick={onClick}
              className="fill-destructive rounded-full icon border"
            />
          )}
        </TooltipTrigger>
        <TooltipContent className="bg-red-400 text-black">
          <p>{tooltip || "Delete"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomDeleteIcon;
