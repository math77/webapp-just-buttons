import { NextRequest, NextResponse } from "next/server";

/*
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);
*/

export async function POST(request: NextRequest) {

  try {

    const data = await request.json();

    console.log("DATA");
    console.log(data);

    /*

    // Validate the data (perform your custom validation logic here)
    if (!data) {
      return NextResponse.json(
        { ok: "Invalid data" },
        { status: 400 }
      );
    }
    

    const { data: insertData, error: insertError } = await supabase
      .from('button')
      .insert([
        {
          nft_creator_address: data.nftCreatorAddress,
          nft_ipfs_uri: data.nftIPFSURI,
          button_id: data.buttonId,
          minted: false
        }
      ])
      .single()


    if (insertError) {
      console.error("Oopss, error! ", insertError);
      return NextResponse.json(
        { ok: "Failed to write data" },
        { status: 400 }
      );
    }
    */

    return NextResponse.json(
      { ok: "Yup, saved! :D" },
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