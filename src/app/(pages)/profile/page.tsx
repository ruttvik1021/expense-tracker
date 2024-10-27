import PaymentSources from "@/components/paymentSources/paymentSources";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdatePassword from "@/components/updatepassword";
import UpdateProfile from "@/components/updateProfile";
import React from "react";

const Profile = () => {
  return (
    <div className="container flex flex-wrap mx-auto p-4 gap-3">
      <div className="flex-1 max-w-2xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="place-items-center w-full">
              <UpdateProfile />
            </div>
          </TabsContent>
          <TabsContent value="password">
            <div className="place-items-center w-full">
              <UpdatePassword />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex-1">
        <PaymentSources />
      </div>
    </div>
  );
};

export default Profile;
