"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Circle, PlusCircleIcon } from "lucide-react";
import { useAuthContext } from "../wrapper/ContextWrapper";
import { Button } from "../ui/button";

const CustomAddIcon = ({
  onClick,
  tooltip,
  type = "ICON",
}: {
  onClick: () => void;
  tooltip?: string;
  type?: "ICON" | "TEXT";
}) => {
  const { isIconPreferred } = useAuthContext();
  return type === "TEXT" ? (
    <Button
      variant="outline"
      className="border border-green-600"
      onClick={onClick}
    >
      Add
    </Button>
  ) : (
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
