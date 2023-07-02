"use client"

import { useState, useEffect, useRef } from "react";

import Modal from "react-modal";
import Image from "next/image";

import { useAccount } from "wagmi"

import Header from "@/components/Header"

import { supabase, channel, readButtonData } from "@/database";


export default function Home() {

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);
  const [clickedButtonId, setClickedButtonId] = useState<number>(0);
  const [words, setWords] = useState<string[]>([
    "0x737ad39499249...87", "@math.eth", "@ola.eth", "@word.eth", "@oiii.eth", "@apa.eth",
    "@aqr.eth", "@brr.eth", "@mor.eth", "@aqq.eth", "@meue.eth", "@promatheus.eth"
  ]);

  const [currentIPFSURI, setCurrentIPFSURI] = useState<string | null>(null);
  const [currentCreator, setCurrentCreator] = useState<string | null>(null);
  const [givePercent, setGivePercent] = useState<boolean>(false);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  //current address minting in some button
  const [minters, setMinters] = useState<string[]>([]);
  //current buttons in "use"
  const [buttons, setButtons] = useState<number[]>([]);

  const formRef = useRef<HTMLFormElement>(null);

  const { address, isConnected } = useAccount();

  /* REALTIME CHECK EFFECT */
  useEffect(() => {
    console.log("LISTEN USEEFFECT");

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        console.log("STATEEE: ", presenceState);

        
        const mintersData = Object.keys(presenceState)
          .map((presenceId) => {
            const presences = presenceState[presenceId] as unknown as { minter: string }[];
            return presences.map((presence) => presence.minter);
          })
          .flat();

        const buttonsData = Object.keys(presenceState)
          .map((presenceId) => {
            const presences = presenceState[presenceId] as unknown as { mintingButtonId: number }[];
            return presences.map((presence) => presence.mintingButtonId);
          })
          .flat();


        let newBtns = Array(5).fill(-1);

        buttonsData.forEach((value) => {
          newBtns[value-1] = value;
        });

        setMinters(mintersData.sort());
        setButtons(newBtns);

      })
      .subscribe()

    return () => {
      channel.unsubscribe();  
    };
  }, [channel]);


  const addNewMinter = async (buttonId: number) => {
    const status = await channel.track({
      minter: address,
      minting: true,
      mintingButtonId: buttonId
    });

    return status;
  };

  const removeMinter = async () => {
    const untrackStatus = await channel.untrack();

    return untrackStatus;
  };

  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {

      const file = e.target.files[0];

      if (file && file.size > 3 * 1024 * 1024) {
        //exceed file size, show message.
        alert("File size exceed. Max 3MB");
        e.target.value = "";
        return;
      }

      setSelectedImage(file);
    }
  };

  const openModal = (buttonId: number) => {
    console.log("CALL OPENMODAL");

    if (!isConnected) {
      setIsWarningOpen(true);
      return;
    }

    if (!isWarningOpen) {

      addNewMinter(buttonId).then(status => {
        console.log("STATUS HERE: ", status);
      });

      setIsModalOpen(true);
      setClickedButtonId(buttonId);
    }
  };

  //ADD THE LEAVE CHANNEL TO DISABLE THE BUTTON
  const closeModal = () => {

    removeMinter().then(status => {
      console.log("STATUS HERE(REMOVE): ", status);
    });

    setClickedButtonId(0);
    setIsModalOpen(false);
    setGivePercent(false);
  };

  const closeWarningModal = () => {
    setIsWarningOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formRef.current) {
      return;
    }

    if (!selectedImage) {
      return;
    }

    let formData = new FormData(formRef.current);
    formData.append("file", selectedImage!);

    console.log("FORM DATA");
    console.log(formData);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Upload successful:", data);
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };


  const uploadToIPFS = async () => {
    let formData = new FormData(formRef.current);
    formData.append("file", selectedImage!);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      //SEE AND RETURN CID OR NULL (IN ERROR CASE)
      if (response.ok) {
        const data = await response.json();
        return data.ok; //cid
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  const createWalletSignature = async (creatorAddress: string, nftURI: string) => {

    const data = { 
      nftIPFSURI: nftURI,
      nftCreatorAddress: creatorAddress,
      buttonId: clickedButtonId,
      userAddress: address
    };

    try {
      const response = await fetch("/api/signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      //SEE AND RETURN CID OR NULL (IN ERROR CASE)
      if (response.ok) {
        const data = await response.json();
        return data.ok; // signature
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }

  };


  const handleNFTSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    /* CHECK IF EVERYTHING WAS FILLED */

    if (!formRef.current) {
      return;
    }

    if (!selectedImage) {
      return;
    }

    /*  */

    const buttonContent = await readButtonData(clickedButtonId);

    const nextNFTMedia = await uploadToIPFS();

    const walletSignature = await createWalletSignature(
      buttonContent.nft_creator_address, 
      buttonContent.nft_ipfs_uri
    );

    //make transaction to mint nft to current minter (address conected...)
    


  };

  const saveModalContent2 = async (event: React.FormEvent) => {
    event.preventDefault();
    /*
    
      WORKFLOW

      Use realtime to block the button "someone is minting"
      Get the data of previous setted NFT (media) (uri, creator, buttonID)SUPABASE
      Upload the new nft for IPFS nft.storage and get the new cid (new media for next nft)

      Make the signature on the server with the data + my project wallet
      Make a transaction to mint the nft for the current minter (old media)

      If the transaction succed, save the data of new nft on supabase, (media for next NFT)
      tag the old one with "minted" and unblock the button.


    */

    const data = { 
      nftIPFSURI: "ipfs://uri-for-test/hi-world-baby-lololol",
      nftCreatorAddress: "0x2f60c9cee6450a8090e17a79e3dd2615a1c419eb",
      buttonId: 4
    };

    try {
      const response = await fetch("/api/insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      const responseData = await response.json();
      console.log("RESPONSE");
      console.log(responseData);
      console.log(response.ok);
      
      if (response.ok) {
        alert(responseData.ok);
      } else {
        // Handle error cases
        alert(response.status);
        console.error("Error:", response.status);
      }
    } catch (error) {
      alert("Error: " +error);
      console.error("Error:", error);
    }
  };


  const renderModal = () => {
    return (
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <h1 className="text-5xl">You'll get something...</h1>
        <p className="text-base">
          Please pick the media that will be associated 
          with this button for the next minter and the emoji
        </p>
        <p>Clicked Button ID: {clickedButtonId}</p>

        <form ref={formRef} onSubmit={saveModalContent2}>

          <div>
            <label htmlFor="nftName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
            <input type="text" id="nftName" name="nftName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Your NFT title" required />
          </div>

          <div>
            <label htmlFor="nftDescription" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your message</label>
            <textarea id="nftDescription" name="nftDescription" rows={4} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your thoughts here..."></textarea>
          </div>

          {selectedImage == null ?
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (3MB MAX FILE SIZE)</p>
                </div>
                <input className="hidden" id="dropzone-file" type="file" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            :
            <div className="flex items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center w-full h-64 border-2 rounded-lg">
                <Image 
                  src={URL.createObjectURL(selectedImage)}
                  style={{objectFit: "contain"}}
                  layout="fixed"
                  width={256}
                  height={256}
                  alt="Image to upload"
                />
              </div>
              <button onClick={() => {setSelectedImage(null)}} className="bg-transparent text-black px-4 py-2 rounded">
                remove the image
              </button>
            </div>
          }

          <div>
            <label className="relative inline-flex items-center mt-2 mb-5 cursor-pointer">
              <input className="sr-only peer" type="checkbox" checked={givePercent} onChange={() => { setGivePercent(!givePercent) }} />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Give my 80% for the @promatheus</span>
            </label>
          </div>


          <div className="flex justify-end mt-4">
            <button type="submit" className="mr-2 bg-blue-500 text-white px-4 py-2 rounded-full">
              Finish
            </button>
            <button onClick={closeModal} className="bg-transparent text-black px-4 py-2 rounded">
              Close
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  const renderConnWalletWarningModal = () => {
    return (
      <Modal
        isOpen={isWarningOpen}
        onRequestClose={closeWarningModal}
        className="modal"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <div className="flex justify-center items-center">
          <div>
            <h1 className="text-1xl">Please, first connect your wallet.</h1>
            <button onClick={closeWarningModal} className="bg-black text-black px-10 py-4 rounded-md">
              ok
            </button>
          </div>
        </div>
      </Modal>
    )
  };

  const renderElectronicPanel = () => {
    return (
      <div className="py-16 mt-6 bg-black">
        <h1 className="text-left ml-2 mb-6 font-bold text-5xl text-white">Button pressers</h1>
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {words.map((word, index) => (
              <span
                key={index}
                className="mx-4 text-4xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"
              >
                {word}
              </span>
            ))}
          </div>
          <div className="absolute top-0 animate-marquee2 whitespace-nowrap">
            {words.map((word, index) => (
              <span
                key={index}
                className="mx-4 text-4xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="h-screen bg-black">
      <Header />
      {minters.length > 0 ?
        <div className="flex justify-center items-center">
          {minters.map((minter, index) => (
            <span
              key={index}
              className="text-base text-green-700"
            >
              {minter}
            </span>
          ))}
          {minters.length > 1 ? <span className="text-base text-white">are minting now</span> : <span className="text-base text-white">is minting now</span>}
        </div>

        : null
      }
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
            disabled={buttons?.[0] > -1 ? true : false}
            onClick={() => openModal(1)}
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
            disabled={buttons?.[1] > -1 ? true : false}
            onClick={() => openModal(2)}
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
            disabled={buttons?.[2] > -1 ? true : false}
            onClick={() => openModal(3)}
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
            disabled={buttons?.[3] > -1 ? true : false}
            onClick={() => openModal(4)}
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
            disabled={buttons?.[4] > -1 ? true : false}
            onClick={() => openModal(5)}
          >
            Mint now, don't regreat later
          </button>
          <p className="text-sm text-white text-center">clicked 0 times so far</p>
        </div>
        {renderModal()}
        {renderConnWalletWarningModal()}
      </div>
      <div className="mt-8 bg-black">
        <h1 className="text-2xl text-center text-white font-semibold mb-2">How to</h1>
        <p className="text-base text-center text-white">Choose an button to click</p>
        <p className="text-base text-center text-white">Do that</p>
        <p className="text-base text-center text-white">Do this</p>
        <p className="text-base text-center text-white">Do here this</p>
      </div>
      {renderElectronicPanel()}
    </main>
  )
}
