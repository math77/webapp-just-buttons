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
      "0xd84d0ea1e675648fa608c36c2c2257dfc6078252",
      "0xaa8c4286883c46ffc3225500f4955f8edc0a351f",
      "0xe42e32a9654d6df8f3415e7129f82bf5adbddd8c",
      "0xf645b4b3e29fd8b2b23d3439b7739fafd11329b8",
      "0x8dd4c6f2206568ae4e93d28ac8f7ec936b9e10e2"
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
    setContractAddress(randAddresses[button-1]);
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
          Choose a button and mint a "free" random NFT on the Zora Network.
        </p>
      </div>
      <div className="flex justify-center items-center bg-black">

        <div>
          <button 
            key={1}
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-red-600 shadow-red-600/50 hover:bg-red-700 text-white font-bold`}
            disabled={isPrepareError || !isConnected || txMintLoading}
            onClick={() => setButton(1)}
          >
            &#128514;&#128514;&#128514; 
          </button>
        </div>
        

        <div>
          <button 
            key={2} 
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-green-600 shadow-green-600/50 hover:bg-green-700 text-white font-bold`}
            disabled={isPrepareError || !isConnected || txMintLoading}
            onClick={() => setButton(2)}
          >
            Mint this stuff you mfers, mint
          </button>
        </div>

        <div>
          <button 
            key={3} 
            className={`py-14 px-14 max-w-xs rounded hover:skew-y-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-yellow-600 shadow-yellow-600/50 hover:bg-yellow-700 text-white font-bold`}
            disabled={isPrepareError || !isConnected || txMintLoading}
            onClick={() => setButton(3)}
          >
            buy
          </button>
        </div>

        <div>
          <button 
            key={4} 
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-blue-600 shadow-blue-600/50 hover:bg-blue-700 text-white font-bold`}
            disabled={isPrepareError || !isConnected || txMintLoading}
            onClick={() => setButton(4)}
          >
            Mint now, and be happy
          </button>
        </div>

        <div>
          <button 
            key={5} 
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-neutral-600 shadow-neutral-600/50 hover:bg-neutral-700 text-white font-bold`}
            disabled={isPrepareError || !isConnected || txMintLoading}
            onClick={() => setButton(5)}
          >
            Mint now, don't regreat later
          </button>
        </div>
      </div>
      <div className="mt-8 bg-black">
        {txMintSuccess && (
          <div>
            <h1 className="text-2xl text-center text-white font-semibold mb-2">
              You got...
            </h1>
            <h1 className="text-2xl text-center text-white font-semibold mb-2">
              {`https://zora.co/collect/zora:${contractAddress}/1`}
            </h1>
          </div>
        )}
      </div>
    </main>
  )
}
