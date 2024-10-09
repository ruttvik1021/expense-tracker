import UpdatePassword from "@/components/updatepassword";
import UpdateProfile from "@/components/updateProfile";
import React from "react";

const Profile = () => {
  return (
    <div className="flex gap-5 flex-wrap">
      <div className="flex-1">
        <UpdateProfile />
      </div>
      <div className="flex-1">
        <UpdatePassword />
      </div>
    </div>
  );
};

export default Profile;
