"use client";
import { Switch } from "@/components/ui/switch";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { Circle, PlusCircleIcon } from "lucide-react";

export const IS_ICON_PREFERRED = "IsIconPreferred";
const IconToggle = () => {
  const { isIconPreferred, setIsIconPreferred } = useAuthContext();
  const handlePreferrenceChange = (value: boolean) => {
    localStorage.setItem(IS_ICON_PREFERRED, String(value));
    setIsIconPreferred(value);
  };
  return (
    <div className="flex items-center w-full gap-3">
      <Circle
        className="fill-green-600 rounded-lg icon border"
        onClick={() => handlePreferrenceChange(false)}
      />
      <Switch
        id="icon toggle"
        checked={isIconPreferred}
        onCheckedChange={handlePreferrenceChange}
      />
      <PlusCircleIcon onClick={() => handlePreferrenceChange(true)} />
    </div>
  );
};

export default IconToggle;
