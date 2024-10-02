"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Circle, SquarePenIcon } from "lucide-react";
import { useAuthContext } from "../wrapper/ContextWrapper";

const CustomEditIcon = ({
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
            <SquarePenIcon onClick={onClick} className="icon" />
          ) : (
            <Circle
              onClick={onClick}
              className="fill-yellow-600 rounded-full icon border"
            />
          )}
        </TooltipTrigger>
        <TooltipContent className="bg-yellow-400 text-black">
          <p>{tooltip || "Edit"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomEditIcon;
