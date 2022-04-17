import {
    ENV_AH,
    AUCTION_HOUSE_ADDRESS,
    WRAPPED_SOL_MINT,
    TOKEN_PROGRAM_ID,
  } from './helpers/constants';
import { PublicKey, SystemProgram, TransactionInstruction } from '../streamTools/node_modules/@solana/web3.js.js'
import { BN, web3 } from '@project-serum/anchor';
import { STREAM_RPC_ENDPOINT, OTHER_MARKETPLACES } from '../streamTools/constants';
import {InstructionsAndSignersSet} from "./helpers/types";

import {
    loadAuctionHouseProgram,
    getAuctionHouseTradeState,
    getTokenAmount,
    getAtaForMint,
    getAuctionHouseBuyerEscrow,
  } from './helpers/accounts';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getPriceWithMantissa } from './helpers/various';

function convertSolVal(sol: any){
  let sol_precision = 6;
  return +sol/1000000000;
}

export async function cancelWithdrawOffer(offerAmount: number, mint: string, buyerWalletKey: PublicKey, mintOwner: any): Promise<InstructionsAndSignersSet> {
    //START CANCEL
    let tokenSize = 1;
    const auctionHouseKey = new web3.PublicKey(AUCTION_HOUSE_ADDRESS);
    const mintKey = new web3.PublicKey(mint);
    let anchorProgram = await loadAuctionHouseProgram(null, ENV_AH, STREAM_RPC_ENDPOINT);
    const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(auctionHouseKey,);
    const sellerWalletKey = new web3.PublicKey(mintOwner);

    //check if escrow amount already exists to determine if we need to deposit amount to Treasury 
    const escrow = (await getAuctionHouseBuyerEscrow(auctionHouseKey, buyerWalletKey))[0];
    const escrow_amount = await getTokenAmount(anchorProgram,escrow,auctionHouseObj.treasuryMint,);
    const escrowSolAmount = convertSolVal(escrow_amount);

    const buyPriceAdjusted = new BN(
      await getPriceWithMantissa(
        offerAmount,
        //@ts-ignore
        auctionHouseObj.treasuryMint,
        buyerWalletKey,
        anchorProgram,
      ),
    );
    //console.log('buyPriceAdjusted:', buyPriceAdjusted);
    const tokenSizeAdjusted = new BN(
      await getPriceWithMantissa(
        tokenSize,
        mintKey,
        buyerWalletKey,
        anchorProgram,
      ),
    );
    
    //const tokenAccountKey = (await getAtaForMint(mintKey, buyerWalletKey))[0];
    const tokenAccountKey = (await getAtaForMint(mintKey, sellerWalletKey))[0];
    
    const tradeState = (
          await getAuctionHouseTradeState(
              auctionHouseKey,
              buyerWalletKey,
              tokenAccountKey,
              //@ts-ignore
              auctionHouseObj.treasuryMint,
              mintKey,
              tokenSizeAdjusted,
              buyPriceAdjusted,
          )
    )[0];  
    
    const signers: any[] = [];

    const instruction = anchorProgram.instruction.cancel(
      buyPriceAdjusted,
      tokenSizeAdjusted,
      {
        accounts: {
          wallet: buyerWalletKey,
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
    
    const instructions = [instruction];
    //END CANCEL

    //START WITHDRAW
    let withdrawAmmount = 0;
    if (escrowSolAmount < offerAmount){
      withdrawAmmount = escrowSolAmount;
    } else {
      withdrawAmmount = offerAmount;
    }
    const amountAdjusted = await getPriceWithMantissa(
      withdrawAmmount,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      buyerWalletKey,
      anchorProgram,
    );

    const [escrowPaymentAccount, bump] = await getAuctionHouseBuyerEscrow(
      auctionHouseKey,
      buyerWalletKey,
    );

    const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT);

    const ata = (
      await getAtaForMint(
        //@ts-ignore
        auctionHouseObj.treasuryMint,
        buyerWalletKey,
      )
    )[0];

    const transferAuthority = web3.Keypair.generate();
    //const signers = isNative ? [] : [transferAuthority];
    const currBal = await getTokenAmount(
      anchorProgram,
      escrowPaymentAccount,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
    ); 

    const instruction2 = anchorProgram.instruction.withdraw(
      bump,
      new BN(amountAdjusted),
      {
        accounts: {
          wallet: buyerWalletKey,
          receiptAccount: isNative ? buyerWalletKey : ata,
          escrowPaymentAccount,
          //@ts-ignore
          treasuryMint: auctionHouseObj.treasuryMint,
          //@ts-ignore
          authority: auctionHouseObj.authority,
          auctionHouse: auctionHouseKey,
          //@ts-ignore
          auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
          ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        },
        signers,
      },
    );

    instructions.push(instruction2);

    const GRAPE_AH_MEMO = {
      state:5, // status (0: withdraw, 1: offer, 2: listing, 3: buy/execute (from listing), 4: buy/execute(accept offer), 5: cancel)
      ah:auctionHouseKey.toString(), // pk
      mint:mint.toString(), // mint
      amount:buyPriceAdjusted.toNumber() // price
    };

    let derivedMintPDA = await web3.PublicKey.findProgramAddress([Buffer.from((mintKey).toBuffer())], auctionHouseKey);
    let derivedBuyerPDA = await web3.PublicKey.findProgramAddress([Buffer.from((buyerWalletKey).toBuffer())], auctionHouseKey);
    let derivedOwnerPDA = await web3.PublicKey.findProgramAddress([Buffer.from((new PublicKey(mintOwner)).toBuffer())], auctionHouseKey);
  

    instructions.push(
      SystemProgram.transfer({
        fromPubkey: buyerWalletKey,
        toPubkey: derivedMintPDA[0],
        lamports: 0,
      })
    );

    instructions.push(
      SystemProgram.transfer({
          fromPubkey: buyerWalletKey,
          toPubkey: derivedBuyerPDA[0],
          lamports: 0,
      })
    );
    instructions.push(
      SystemProgram.transfer({
          fromPubkey: buyerWalletKey,
          toPubkey: derivedOwnerPDA[0],
          lamports: 0,
      })
    );
    instructions.push(
      new TransactionInstruction({
          keys: [{ pubkey: buyerWalletKey, isSigner: true, isWritable: true }],
          data: Buffer.from(JSON.stringify(GRAPE_AH_MEMO), 'utf-8'),
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      })
    );

    return {
      signers: signers,
      instructions: instructions
    }

}