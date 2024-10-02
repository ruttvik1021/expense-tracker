"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeftRightIcon,
  CircleIcon,
  PlusCircleIcon,
  SquarePenIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { Separator } from "../ui/separator";

const IconPreferenceAlert = () => {
  const [open, setOpen] = useState(false);
  const [dontRemind, setDontRemind] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleCheckbox = (value: boolean) => {
    localStorage.setItem("isIconAlertRead", "true");
    setDontRemind(value);
  };

  useLayoutEffect(() => {
    const isIconAlertRead = localStorage.getItem("isIconAlertRead") !== "true";
    setOpen(isIconAlertRead);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[80%]" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Icon Preferences
          </DialogTitle>
          <DialogDescription>
            You can change the Icon Preferences by clicking the User Icon at the
            Top Right Corner.
          </DialogDescription>
          <Separator />
        </DialogHeader>
        <div className="pb-4">
          <h3 className="text-sm font-medium mb-2">Available Icon Sets:</h3>
          <div className="flex justify-around">
            <div className="flex gap-2">
              <CircleIcon className="fill-green-600  rounded-full icon border cursor-default" />
              <CircleIcon className="fill-yellow-600 rounded-full icon border cursor-default" />
              <CircleIcon className="fill-red-600 rounded-full icon border cursor-default" />
            </div>
            <ArrowLeftRightIcon className="text-selected icon fill-current cursor-default" />
            <div className="flex gap-2">
              <PlusCircleIcon className="icon cursor-default" />
              <SquarePenIcon className="icon cursor-default" />
              <Trash2Icon className="icon cursor-default" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="dontRemind"
            checked={dontRemind}
            onCheckedChange={(value: boolean) => handleCheckbox(value)}
          />
          <label
            htmlFor="dontRemind"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Don't remind me later
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IconPreferenceAlert;
