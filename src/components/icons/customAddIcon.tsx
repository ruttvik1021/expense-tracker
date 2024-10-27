"use client";
import { Circle, PlusCircleIcon } from "lucide-react";
import CommonTooltip from "../common/CommonTooltip";
import { Button } from "../ui/button";
import { useAuthContext } from "../wrapper/ContextWrapper";
import { TooltipTrigger } from "../ui/tooltip";

const CustomAddIcon = ({
  onClick,
  tooltip = "Add",
  type = "ICON",
  disabled = false,
}: {
  onClick: () => void;
  tooltip?: string;
  type?: "ICON" | "TEXT";
  disabled?: boolean;
}) => {
  const { isIconPreferred } = useAuthContext();

  if (type === "TEXT") {
    return (
      <Button
        variant="outline"
        className="border border-green-600"
        onClick={onClick}
        disabled={disabled}
      >
        {tooltip}
      </Button>
    );
  }

  const IconComponent = isIconPreferred ? PlusCircleIcon : Circle;
  const iconClass = `icon ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;
  const iconStyle = isIconPreferred ? "" : "fill-green-600 rounded-full border";

  return (
    <CommonTooltip
      trigger={
        <TooltipTrigger asChild>
          <IconComponent
            onClick={!disabled ? onClick : undefined}
            className={`${iconClass} ${iconStyle}`}
          />
        </TooltipTrigger>
      }
      text={tooltip}
      hoverClass="bg-green-200"
    />
  );
};

export default CustomAddIcon;
