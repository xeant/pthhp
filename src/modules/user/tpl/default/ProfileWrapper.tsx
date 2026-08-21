"use client";

import ProfileComponent from "@components/account/Profile";

export default function ProfileWrapper({ currentUser }: { currentUser: any }) {
  return (
    <div className="py-16">
      <ProfileComponent
        profileName={currentUser?.accountId ?? "손님"}
        profileEmail={currentUser?.email_address ?? ""}
      />
    </div>
  );
}