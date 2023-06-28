import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/schema';

import { ButtonType } from '@/types/types';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseKey, {
    realtime: {
      params: {
        eventsPerSecond: 10
      },
    },
  }
);

export const channel = supabase.channel("room1"); 

export async function readButtonData(buttonId: number) {
  const { data, error } = await supabase
    .from('button')
    .select('button_id, nft_ipfs_uri, nft_creator_address, minted')
    .eq('minted', false)
    .eq('button_id', buttonId)
    .single()


  return { data, error }
};