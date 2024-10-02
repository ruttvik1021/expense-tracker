import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { Circle, PlusCircleIcon } from "lucide-react";
import React, { useEffect } from "react";

export const IS_ICON_PREFERRED = "IsIconPreferred";
const IconToggle = () => {
  const { isIconPreferred, setIsIconPreferred } = useAuthContext();
  const handlePreferrenceChange = (value: boolean) => {
    localStorage.setItem(IS_ICON_PREFERRED, String(value));
    setIsIconPreferred(value);
  };
  return (
    <div className="flex justify-between items-center w-full">
      <Circle className="fill-green-600 rounded-full icon border" />
      <Switch
        id="icon toggle"
        checked={isIconPreferred}
        onCheckedChange={handlePreferrenceChange}
      />
      <PlusCircleIcon />
    </div>
  );
};

export default IconToggle;
