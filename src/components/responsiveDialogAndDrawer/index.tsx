import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useDeviceType } from "@/hooks/useMediaQuery";
import React from "react";

const ResponsiveDialogAndDrawer = ({
  open,
  setOpen,
  handleClose,
  title,
  triggerButton,
  content,
}: {
  open: boolean;
  setOpen: () => void
  handleClose: () => void;
  title: string;
  triggerButton?: React.ReactNode;
  content: React.ReactNode;
}) => {
  const { isDesktop } = useDeviceType();
  return isDesktop ? (
    <Dialog open={open}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{content}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={() => setOpen()}>
      {triggerButton && <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{content}</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsiveDialogAndDrawer;
