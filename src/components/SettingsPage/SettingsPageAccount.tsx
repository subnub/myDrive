import React from "react";

interface SettingsPageAccountProps {
  user: {
    _id: string;
    email: string;
  };
}

const SettingsPageAccount: React.FC<SettingsPageAccountProps> = ({ user }) => {
  return (
    <div>
      <div className="bg-white-hover p-3 flex items-center w-full">
        <p className="text-base">Account</p>
      </div>
      <div>
        <div className="p-3 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Email</p>
          <p>{user.email}</p>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Change password</p>
          <p className="text-primary hover:text-primary-hover cursor-pointer">
            Change
          </p>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Logout account</p>
          <p className="text-primary hover:text-primary-hover cursor-pointer">
            Logout
          </p>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Logout all account</p>
          <p className="text-primary hover:text-primary-hover cursor-pointer">
            Logout all
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageAccount;
