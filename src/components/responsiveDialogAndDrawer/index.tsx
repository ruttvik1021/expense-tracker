import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeviceType } from "@/hooks/useMediaQuery";
import React from "react";

const ResponsiveDialogAndDrawer = ({
  open,
  handleClose,
  title,
  triggerButton,
  content,
}: {
  open: boolean;
  handleClose: () => void;
  title: string;
  triggerButton?: React.ReactNode;
  content: React.ReactNode;
}) => {
  const { isDesktop } = useDeviceType();
  return isDesktop ? (
    <Dialog open={open} modal>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{content}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ) : (
    <div className="m-3">
      <Dialog open={open} modal>
        {triggerButton && (
          <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        )}
        <DialogContent className="border" onClose={handleClose}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{content}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResponsiveDialogAndDrawer;
