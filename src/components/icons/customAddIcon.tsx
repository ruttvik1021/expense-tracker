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
  disabled,
}: {
  onClick: () => void;
  tooltip?: string;
  type?: "ICON" | "TEXT";
  disabled?: boolean;
}) => {
  const { isIconPreferred } = useAuthContext();
  return type === "TEXT" ? (
    <Button
      variant="outline"
      className="border border-green-600"
      onClick={onClick}
      disabled={disabled}
    >
      Add
    </Button>
  ) : (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {disabled ? (
            // Render the icon without the TooltipTrigger if disabled
            isIconPreferred ? (
              <PlusCircleIcon className="icon opacity-50 cursor-not-allowed" />
            ) : (
              <Circle className="fill-green-600 rounded-full icon border opacity-50 cursor-not-allowed" />
            )
          ) : (
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
