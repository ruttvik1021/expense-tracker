import { Loader2 } from "lucide-react";
import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black/80 bg-opacity-70">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
};

export default Loader;
