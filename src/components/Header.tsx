"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";


const Header = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-black">
      <div className="flex gap-2">
        <h1 className="font-normal lg:font-semibold text-white">LUCKY BUTTONS</h1>
      </div>
      <div className="flex items-center gap-8">
        <ConnectButton />
      </div>
    </div>
  );
};

export default Header;