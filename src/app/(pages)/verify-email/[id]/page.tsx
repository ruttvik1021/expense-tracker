"use client";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { verifyEmail } from "../../../../../server/actions/email/email";

const VerifyEmail = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { isAuthenticated, logoutUser, verifyUserEmail } = useAuthContext();
  const verifyUser = async () => {
    const verification = await verifyEmail(params.id);
    if (verification.error) {
      toast.error(verification.error);
    }
    if (verification.message) {
      verifyUserEmail();
      toast.success(verification.message);
    }
    isAuthenticated ? router.push("/") : logoutUser();
  };

  React.useEffect(() => {
    verifyUser();
  }, [params]);
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Label>Verifying your email...</Label>
    </div>
  );
};

export default VerifyEmail;
