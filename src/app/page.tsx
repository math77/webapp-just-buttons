"use client"

import { useState, useEffect } from "react";

import Modal from "react-modal";
import Image from "next/image";

import {
  Address,
  useAccount,
  useContractWrite,
  useWaitForTransaction,
  usePrepareContractWrite,
} from "wagmi";

import { parseEther } from "viem";


import Header from "@/components/Header";
import Pending from "@/components/Pending";

import { CHAIN_ID, abi } from "../contracts_stuff";


const mintReferral = "0x5ec02bFe7cef41c80ACEba81B1e9B012Bdd3c15A" as Address;

export default function Home() {

  const [clickedButtonId, setClickedButtonId] = useState<number>(0);
  const [contractAddress, setContractAddress] = useState<string>("");
  const [randAddresses, setRandAddresses] = useState<string[]>([]);

  const { address, isConnected } = useAccount();


  const { config: mintWriteConfig, error: prepareError, isError: isPrepareError } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: abi,
    functionName: "mintWithRewards",
    chainId: CHAIN_ID,
    args: address ? [address, BigInt(1), "", mintReferral] : ["" as Address, BigInt(1), "", mintReferral],
    value: parseEther('0.000777'),
    enabled: isConnected
  });

  const {
    data: mintData,
    error: mintError,
    isError,
    write: mint
  } = useContractWrite(mintWriteConfig);

  const {
    data: txMintData,
    isLoading: txMintLoading,
    isSuccess: txMintSuccess,
    error: txMintError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const shuffleArray = () => {

    let addresses = [
      "",
      "",
      "",
      "",
      ""
    ];


    for (let i = addresses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = addresses[i];
      addresses[i] = addresses[j];
      addresses[j] = temp;
    }

    return addresses;
  };

  const setButton = (button: number) => {
    setContractAddress(randAddresses[button]);
  };

  useEffect(() => {
    setRandAddresses(shuffleArray());
  })

  //disabled={isPrepareError || !isConnected || txMintLoading}
  //{!txMintLoading ? 'Create' : <Pending className="animate-spin" />}

  return (
    <main className="h-screen bg-black">
      <Header />
      <div className="flex justify-center items-center mt-4 mb-6">
        <p className="text-base text-center text-justify text-white w-[32rem]">
          The doubts over funding are one of the many political challenges facing the 
          nature restoration reforms, which have become one of Brussels’ 
          most contentious pieces of legislation this year
        </p>
      </div>
      <div className="flex justify-center items-center mt-4 mb-6 bg-black">
        <p className="mt-4 text-white text-1xl text-center text-justify font-bold w-[42rem]">
          How we choose, what we receive, how we react, and what we decide to give to others.
        </p>
      </div>
      <div className="flex justify-center items-center bg-black">

        <div>
          <p className="text-sm text-white text-center">Ξ 0.5</p>
          <button 
            key={1}
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-red-600 shadow-red-600/50 hover:bg-red-700 text-white font-bold`}
            disabled={isPrepareError || !isConnected || txMintLoading}
            onClick={() => setButton(1)}
          >
            &#128514;&#128514;&#128514; 
          </button>
          <p className="text-sm text-white text-center">clicked 4 times so far</p>
        </div>
        

        <div>
          <p className="text-sm text-white text-center">Ξ 0.5</p>
          <button 
            key={2} 
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-green-600 shadow-green-600/50 hover:bg-green-700 text-white font-bold`}
            disabled={isPrepareError || !isConnected || txMintLoading}
            onClick={() => setClickedButtonId(2)}
          >
            Mint this stuff you mfers, min
          </button>
          <p className="text-sm text-white text-center">clicked 40 times so far</p>
        </div>

        <div>
          <p className="text-sm text-white text-center">Ξ 0.5</p>
          <button 
            key={3} 
            className={`py-14 px-14 max-w-xs rounded hover:skew-y-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-yellow-600 shadow-yellow-600/50 hover:bg-yellow-700 text-white font-bold`}
            disabled={isPrepareError || !isConnected || txMintLoading}
            onClick={() => setClickedButtonId(3)}
          >
            buy
          </button>
          <p className="text-sm text-white text-center">clicked 43123 times so far</p>
        </div>

        <div>
          <p className="text-sm text-white text-center">Ξ 0.5</p>
          <button 
            key={4} 
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-blue-600 shadow-blue-600/50 hover:bg-blue-700 text-white font-bold`}
            disabled={isPrepareError || !isConnected || txMintLoading}
            onClick={() => setClickedButtonId(4)}
          >
            Mint now, and be happy
          </button>
          <p className="text-sm text-white text-center">clicked 1 times so far</p>
        </div>

        <div>
          <p className="text-sm text-white text-center">Ξ 0.5</p>
          <button 
            key={5} 
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-neutral-600 shadow-neutral-600/50 hover:bg-neutral-700 text-white font-bold`}
            disabled={isPrepareError || !isConnected || txMintLoading}
            onClick={() => setClickedButtonId(5)}
          >
            Mint now, don't regreat later
          </button>
          <p className="text-sm text-white text-center">clicked 0 times so far</p>
        </div>
      </div>
      <div className="mt-8 bg-black">
        <h1 className="text-2xl text-center text-white font-semibold mb-2">How to</h1>
        <p className="text-base text-center text-white">Choose an button to click</p>
        <p className="text-base text-center text-white">Do that</p>
        <p className="text-base text-center text-white">Do this</p>
        <p className="text-base text-center text-white">Do here this</p>
      </div>
    </main>
  )
}
