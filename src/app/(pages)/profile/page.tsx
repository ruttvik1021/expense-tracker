import PaymentSources from "@/components/paymentSources/paymentSources";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdatePassword from "@/components/updatepassword";
import UpdateProfile from "@/components/updateProfile";
import React from "react";

const Profile = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <UpdateProfile />
            <PaymentSources />
          </TabsContent>
          <TabsContent value="password">
            <UpdatePassword />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
