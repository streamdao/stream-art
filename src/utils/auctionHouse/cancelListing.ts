import {
    ENV_AH,
    AUCTION_HOUSE_ADDRESS,
    TOKEN_PROGRAM_ID,
  } from './helpers/constants';
import { PublicKey, SystemProgram, TransactionInstruction } from '../streamTools/node_modules/@solana/web3.js.js'
import { BN, web3 } from '@project-serum/anchor';
import { STREAM_RPC_ENDPOINT, OTHER_MARKETPLACES } from '../streamTools/constants';
import {InstructionsAndSignersSet} from "./helpers/types";

import {
    loadAuctionHouseProgram,
    getAuctionHouseTradeState,
    getAtaForMint,
  } from './helpers/accounts';
import { getPriceWithMantissa } from './helpers/various';

export async function cancelListing(offerAmount: number, mint: string, walletPublicKey: string, mintOwner: any): Promise<InstructionsAndSignersSet> {

    let tokenSize = 1;
    const auctionHouseKey = new web3.PublicKey(AUCTION_HOUSE_ADDRESS);
    const mintKey = new web3.PublicKey(mint);
    let anchorProgram = await loadAuctionHouseProgram(null, ENV_AH, STREAM_RPC_ENDPOINT);
    const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(auctionHouseKey,);
    const sellerWalletKey = new web3.PublicKey(walletPublicKey);
    const buyPriceAdjusted = new BN(
      await getPriceWithMantissa(
        offerAmount,
        //@ts-ignore
        auctionHouseObj.treasuryMint,
        sellerWalletKey,
        anchorProgram,
      ),
    );
    //console.log('buyPriceAdjusted:', buyPriceAdjusted);
    const tokenSizeAdjusted = new BN(
      await getPriceWithMantissa(
        tokenSize,
        mintKey,
        sellerWalletKey,
        anchorProgram,
      ),
    );
    //console.log('tokenSizeAdjusted:', tokenSizeAdjusted);
    const tokenAccountKey = (await getAtaForMint(mintKey, sellerWalletKey))[0];
    //console.log('tokenAccountKey:', tokenAccountKey.toBase58());
    const tradeState = (
          await getAuctionHouseTradeState(
              auctionHouseKey,
              sellerWalletKey,
              tokenAccountKey,
              //@ts-ignore
              auctionHouseObj.treasuryMint,
              mintKey,
              tokenSizeAdjusted,
              buyPriceAdjusted,
          )
    )[0];  
    //console.log('tradeState:', tradeState.toBase58());
    const signers: any[] = [];

    const instruction = anchorProgram.instruction.cancel(
      buyPriceAdjusted,
      tokenSizeAdjusted,
      {
        accounts: {
          wallet: sellerWalletKey,
          tokenAccount: tokenAccountKey,
          tokenMint: mintKey,
          //@ts-ignore
          authority: auctionHouseObj.authority,
          auctionHouse: auctionHouseKey,
          //@ts-ignore
          auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
          tradeState,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers,
      },
    );
    //console.log("instruction: "+JSON.stringify(instruction));
    const instructions = [instruction];

    let derivedMintPDA = await web3.PublicKey.findProgramAddress([Buffer.from((mintKey).toBuffer())], auctionHouseKey);
    let derivedBuyerPDA = await web3.PublicKey.findProgramAddress([Buffer.from((sellerWalletKey).toBuffer())], auctionHouseKey);
    let derivedOwnerPDA = await web3.PublicKey.findProgramAddress([Buffer.from((new PublicKey(mintOwner)).toBuffer())], auctionHouseKey);
  
    //is it withdraw here or cancel (we are removing the listing we made)
    const GRAPE_AH_MEMO = {
      state:5, // status (0: withdraw, 1: offer, 2: listing, 3: buy/execute (from listing), 4: buy/execute(accept offer), 5: cancel)
      ah:auctionHouseKey.toString(), // pk
      mint:mintKey.toString(), // mint
      amount:buyPriceAdjusted.toNumber() // price
    };

    instructions.push(
      SystemProgram.transfer({
        fromPubkey: sellerWalletKey,
        toPubkey: derivedMintPDA[0],
        lamports: 0,
      })
    );

    instructions.push(
      SystemProgram.transfer({
          fromPubkey: sellerWalletKey,
          toPubkey: derivedBuyerPDA[0],
          lamports: 0,
      })
    );
    instructions.push(
      SystemProgram.transfer({
          fromPubkey: sellerWalletKey,
          toPubkey: derivedOwnerPDA[0],
          lamports: 0,
      })
    );
    instructions.push(
      new TransactionInstruction({
          keys: [{ pubkey: sellerWalletKey, isSigner: true, isWritable: true }],
          data: Buffer.from(JSON.stringify(GRAPE_AH_MEMO), 'utf-8'),
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      })
    );

    return {
      signers: signers,
      instructions: instructions
    }

}