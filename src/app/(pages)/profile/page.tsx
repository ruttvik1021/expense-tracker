"use client";
import PageHeader from "@/components/common/Pageheader";
import IconToggle from "@/components/common/Toggles/IconToggle";
import PaymentSources from "@/components/paymentSources/paymentSources";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UpdatePassword from "@/components/updatepassword";
import UpdateProfile from "@/components/updateProfile";

const Profile = () => {
  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        <Card>
          {" "}
          <CardContent className="space-y-6">
            <PaymentSources />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <PageHeader title={"Profile Settings"} />
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

        <Card>
          <CardHeader>
            <PageHeader title={"Icon Preferences"} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-between"
            >
              <IconToggle />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
