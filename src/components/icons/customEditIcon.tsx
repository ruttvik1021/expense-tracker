"use client";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { Circle, SquarePenIcon } from "lucide-react";
import CommonTooltip from "../common/CommonTooltip";
import { useAuthContext } from "../wrapper/ContextWrapper";
import { Button } from "../ui/button";

const CustomEditIcon = ({
  onClick,
  tooltip = "Edit",
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
        className="border border-yellow-600"
        onClick={onClick}
        disabled={disabled}
      >
        {tooltip}
      </Button>
    );
  }

  const IconComponent = isIconPreferred ? SquarePenIcon : Circle;
  const iconStyle = isIconPreferred
    ? "icon"
    : "fill-yellow-600 rounded-full icon border";

  return (
    <CommonTooltip
      trigger={
        <TooltipTrigger asChild>
          <IconComponent onClick={onClick} className={iconStyle} />
        </TooltipTrigger>
      }
      text={tooltip}
      hoverClass="bg-yellow-200"
    />
  );
};

export default CustomEditIcon;
