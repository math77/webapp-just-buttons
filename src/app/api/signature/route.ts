import { NextRequest, NextResponse } from "next/server";

import { privateKeyToAccount } from 'viem/accounts'
import { createWalletClient, http, keccak256, encodePacked } from 'viem'
import { goerli } from 'viem/chains'


const PRIVATE_KEY = process.env.JUST_BUTTONS_PRIVATE_KEY as string


export async function POST(request: NextRequest) {

  try {

    const { data } = await request.json();

    if (!data) {
      return NextResponse.json(
        { ok: "Invalid data" },
        { status: 405 }
      );
    }

    const walletClient = createWalletClient({
      account: privateKeyToAccount(`0x${PRIVATE_KEY}`),
      chain: goerli,
      transport: http('https://eth-goerli.g.alchemy.com/v2/y-oWXWtIp_EAdgGZEBSrsuNjsOj26I3A')
    })

    const msg = keccak256(encodePacked(
      ['uint', 'address', 'string', 'address'],
      [data.buttonId, data.nftCreatorAddress, data.nftIPFSURI, data.userAddress]
    ))

    const signature = await walletClient.signMessage({
      message: msg
    })

    return NextResponse.json(
      { ok: signature },
      { status: 200 }
    );

    
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { ok: "Internal server error :(" },
      { status: 500 }
    );
  }

}