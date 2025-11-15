"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangleIcon } from "lucide-react";
import { toast } from "sonner";
import { resendVerificationMail } from "../../../server/actions/email/email";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useAuthContext } from "../wrapper/ContextWrapper";

const EmailVerification = () => {
  const { isAuthenticated, isEmailVerified } = useAuthContext();

  const { mutate: resendEmail, isPending } = useMutation({
    mutationFn: () => resendVerificationMail(),
    onSettled(data) {
      toast.success(data?.message);
    },
  });

  if (isAuthenticated && !isEmailVerified) {
    return (
      <div className="flex justify-center items-center w-full p-3">
        <Alert className="bg-destructive/60">
          <AlertDescription className="font-bold text-black">
            <Label className="flex items-center gap-2 text-md">
              <AlertTriangleIcon className="w-5 h-5" /> Please verify the email
              sent to you.
              <Button
                className="h-5 p-2"
                variant="secondary"
                onClick={() => resendEmail()}
                loading={isPending}
              >
                Resend
              </Button>
            </Label>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return null;
};

export const FeatureRestrictedWarning = ({ message }: { message: string }) => {
  return (
    <Alert className="bg-destructive/20 rounded-md my-2">
      <AlertDescription className="font-bold text-black">
        <span className="flex items-center gap-2 text-md text-foreground">
          {message}
        </span>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerification;
