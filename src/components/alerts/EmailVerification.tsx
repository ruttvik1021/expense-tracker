"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useAuthContext } from "../wrapper/ContextWrapper";

const EmailVerification = () => {
  const { isAuthenticated, isEmailVerified } = useAuthContext();

  if (isAuthenticated && !isEmailVerified) {
    return (
      <Alert className="bg-destructive rounded-none rounded-b-2xl">
        <AlertDescription className="font-bold text-black">
          <Label className="flex items-center gap-2 text-sm">
            <AlertTriangleIcon className="w-5 h-5" /> Please verify the email
            sent to you.
            <Button className="h-5 p-2" variant="secondary">
              Resend
            </Button>
          </Label>
        </AlertDescription>
      </Alert>
    );
  }
  return null;
};

export default EmailVerification;
