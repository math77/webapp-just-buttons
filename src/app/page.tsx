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

import { parseEther, stringToBytes, encodeAbiParameters, parseAbiParameters } from "viem";


import Header from "@/components/Header";
import Pending from "@/components/Pending";

import { CHAIN_ID, abi } from "../contracts_stuff";


const saleStrategyAddress = "0x04E2516A2c207E84a1839755675dfd8eF6302F0a" as Address; // For chain 999
const mintReferral = "0x5ec02bFe7cef41c80ACEba81B1e9B012Bdd3c15A" as Address;


export default function Home() {

  const [clickedButtonId, setClickedButtonId] = useState<number>(-1);
  const [contractAddress, setContractAddress] = useState<string>("");
  const [randAddresses, setRandAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { address: userAddress, isConnected } = useAccount();

  const buttonValid = clickedButtonId > -1;

  const mintTokenId = BigInt(1);
  const mintQuantity = BigInt(1);

  let encodedParams;
  if (userAddress) {
    encodedParams = encodeAbiParameters(parseAbiParameters('address'), [userAddress]);
  } else {
    encodedParams = encodeAbiParameters(parseAbiParameters('address'), [saleStrategyAddress]);
  }

  const { config: mintWriteConfig, error: prepareError, isError: isPrepareError } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: abi,
    functionName: "mintWithRewards",
    chainId: CHAIN_ID,
    args: userAddress ? [saleStrategyAddress, mintTokenId, mintQuantity, encodedParams, mintReferral] : [saleStrategyAddress, mintTokenId, mintQuantity, encodedParams, mintReferral],
    value: parseEther('0.000777'),
    enabled: buttonValid
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
      "0x3411fe5f5dae4c3cc0efaea59ae7b4c2723d5c40" as Address,
      "0xaa8c4286883c46ffc3225500f4955f8edc0a351f" as Address,
      "0x124faf2a02ae157b6a871d34e36c14f5c1057ce1" as Address,
      "0xf645b4b3e29fd8b2b23d3439b7739fafd11329b8" as Address,
      "0x8dd4c6f2206568ae4e93d28ac8f7ec936b9e10e2" as Address
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
    setClickedButtonId(button-1);
    setContractAddress(randAddresses[button-1]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    setRandAddresses(shuffleArray());
  }, []);


  const renderSetSuccessorModal = () => {
    return (
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal h-fit"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      > 
        <div className="flex justify-center items-center">
          {!txMintSuccess && (
            <div className="grid justify-items-center">
              <h1 className="mb-6 text-4xl font-bold text-black">
                This button, are you sure...? really?!
              </h1>
              <button 
                disabled={isPrepareError || !isConnected || txMintLoading}
                className="cursor-pointer bg-gray-800 text-white font-semibold px-8 py-2 rounded-md mt-12 hover:bg-gray-900"
                onClick={() => mint?.()}
              >
                {!txMintLoading ? 'Yes, mint!' : <Pending className="animate-spin" />}
              </button>
              <button 
                disabled={txMintLoading}
                className="cursor-pointer bg-transparent text-black font-semibold px-8 py-2 rounded-md mt-12 hover:bg-gray-900 hover:text-white"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          )}

          {txMintSuccess && (
            <div>
              <h1 className="text-2xl text-center text-black font-semibold mb-2">
                You got...
              </h1>
              <a 
                className="text-2xl text-center text-black font-semibold mb-2"
                href={`https://zora.co/collect/zora:${contractAddress}/1`}
                target="_blank"
              >
                Click here
              </a>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <main className="h-screen bg-black">
      <Header />
      <div className="flex justify-center items-center mt-4 mb-6">
        <p className="text-base text-center text-justify text-white w-[32rem]">
          Choose a button and mint a "free" random NFT on the ZORA Network!!!
        </p>
      </div>
      {!isConnected && (
        <div className="flex justify-center items-center mt-4 mb-6">
          <p className="text-base text-center italic font-bold text-justify text-white w-[32rem]">
            Please, connect your wallet!
          </p>
        </div>
      )}
      <div className="flex justify-center items-center bg-black">

        <div>
          <button 
            key={1}
            disabled={!isConnected}
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-red-600 shadow-red-600/50 hover:bg-red-700 text-white font-bold`}
            onClick={() => setButton(1)}
          >
            Maybe, I mint this one... 
          </button>
        </div>
        

        <div>
          <button 
            key={2} 
            disabled={!isConnected}
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-green-600 shadow-green-600/50 hover:bg-green-700 text-white font-bold`}
            onClick={() => setButton(2)}
          >
            Mint this stuff you mfer, mint
          </button>
        </div>

        <div>
          <button 
            key={3} 
            disabled={!isConnected}
            className={`py-14 px-14 max-w-xs rounded hover:skew-y-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-yellow-600 shadow-yellow-600/50 hover:bg-yellow-700 text-white font-bold`}
            onClick={() => setButton(3)}
          >
            buy
          </button>
        </div>

        <div>
          <button 
            key={4} 
            disabled={!isConnected}
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-blue-600 shadow-blue-600/50 hover:bg-blue-700 text-white font-bold`}
            onClick={() => setButton(4)}
          >
            Mint now, and be happy
          </button>
        </div>

        <div>
          <button 
            key={5} 
            disabled={!isConnected}
            className={`py-10 px-10 max-w-xs rounded hover:skew-x-12 shadow-lg mt-2 mb-2 mr-2 ml-2 bg-neutral-600 shadow-neutral-600/50 hover:bg-neutral-700 text-white font-bold`}
            onClick={() => setButton(5)}
          >
            Mint now, don't regreat later
          </button>
        </div>
      </div>
      {renderSetSuccessorModal()}
    </main>
  )
}
