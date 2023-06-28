import { NextRequest, NextResponse } from "next/server";

import { NFTStorage, File, Blob } from "nft.storage";

const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY as string;


export async function POST(request: NextRequest) {
  const formData = await request.formData();


  console.log("FORM DATA");
  console.log(formData);

  const file = formData.get("file") as Blob | null;
  const nftName = formData.get("nftName") as string | null;
  const nftDescription = formData.get("nftDescription") as string | null;
  
  if (!file) {
    return NextResponse.json(
      { ok: false },
      { data: null },
      { status: 400 }
    );
  }


  try {

    const buffer = Buffer.from(await file.arrayBuffer());

    const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });

    const imageFile = new File([buffer], file.name, { type: file.type });
    const metadata = await client.store({
      name: nftName,
      description: nftDescription,
      image: imageFile
    });

    const ipnft = metadata.ipnft;
    const cid = metadata.url; //ipnft with ipfs://ipfnt/metadata.json

    return NextResponse.json(
      { ok: true },
      { data: cid },
      { status: 200 }
    );


  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { ok: false },
      { data: null },
      { status: 500 }
    );

  }
}