"use client";
import PaymentSources from "@/components/paymentSources/paymentSources";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UpdatePassword from "@/components/updatepassword";
import UpdateProfile from "@/components/updateProfile";

const Profile = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <Card>
          {" "}
          <CardContent className="space-y-6">
            <PaymentSources />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <UpdateProfile />
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Security</h3>
              <UpdatePassword />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
