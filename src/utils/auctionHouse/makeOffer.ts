import {
    ENV_AH,
    AUCTION_HOUSE_ADDRESS,
    WRAPPED_SOL_MINT,
    TOKEN_PROGRAM_ID,
  } from './helpers/constants';
import { 
  Transaction, 
  PublicKey, 
  SystemProgram, 
  TransactionInstruction, 
  LAMPORTS_PER_SOL,
  SYSVAR_INSTRUCTIONS_PUBKEY
} from '../streamTools/node_modules/@solana/web3.js.js'
import { BN, web3 } from '@project-serum/anchor';
import { STREAM_RPC_ENDPOINT, OTHER_MARKETPLACES } from '../streamTools/constants';
import {InstructionsAndSignersSet} from "./helpers/types";

import { AuctionHouseProgram } from '@metaplex-foundation/mpl-auction-house'
//import { MetadataProgram, Metadata, deprecated } from '@metaplex-foundation/mpl-token-metadata'
import { deprecated } from "@metaplex-foundation/mpl-token-metadata";

import {
    loadAuctionHouseProgram,
    getAuctionHouseTradeState,
    getTokenAmount,
    getAtaForMint,
    getAuctionHouseBuyerEscrow,
    getMetadata,
  } from './helpers/accounts';
import { getPriceWithMantissa } from './helpers/various';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';

import { TokenAmount } from '../streamTools/safe-math';

const {
  createPublicBuyInstruction,
  createPrintBidReceiptInstruction,
  createDepositInstruction,
} = AuctionHouseProgram.instructions
interface OfferForm {
  amount: string
}

function convertSolVal(sol: any){
    sol = parseFloat(new TokenAmount(sol, 9).format());
    return sol;
}

export async function makeOffer(offerAmount: number, mint: string, walletPublicKey: string, mintOwner: any): Promise<InstructionsAndSignersSet> {
    //const { publicKey, signTransaction } = useWallet();

    let tokenSize = 1;
    const auctionHouseKey = new web3.PublicKey(AUCTION_HOUSE_ADDRESS);
    const mintKey = new web3.PublicKey(mint);
    let anchorProgram = await loadAuctionHouseProgram(null, ENV_AH, STREAM_RPC_ENDPOINT);
    const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(auctionHouseKey,);    
    const buyerWalletKey = new web3.PublicKey(walletPublicKey);
    //check if escrow amount already exists to determine if we need to deposit amount to Treasury 
    const escrow = (await getAuctionHouseBuyerEscrow(auctionHouseKey, buyerWalletKey))[0];
    const escrow_amount = await getTokenAmount(anchorProgram,escrow,auctionHouseObj.treasuryMint,);
    const escrowSolAmount = convertSolVal(escrow_amount);
    //console.log('escrow_amount:',escrowSolAmount, 'offerAmount:', offerAmount);
    
    const buyerPrice = Number(offerAmount) * LAMPORTS_PER_SOL
    const auctionHouse = new PublicKey(auctionHouseObj.auctionHouse.address)
    const authority = new PublicKey(auctionHouseObj.auctionHouse.authority)
    const auctionHouseFeeAccount = new PublicKey(
      auctionHouseObj.auctionHouse.auctionHouseFeeAccount
    )
    const treasuryMint = new PublicKey(auctionHouseObj.auctionHouse.treasuryMint)
    const tokenMint = mintKey
    const tokenAccount = new PublicKey(mintOwner.owner.associatedTokenAccountAddress)
    
    const [escrowPaymentAccount, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(
        auctionHouse,
        new PublicKey(walletPublicKey)
      )

    const [buyerTradeState, tradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        new PublicKey(walletPublicKey),
        auctionHouse,
        treasuryMint,
        tokenMint,
        buyerPrice,
        1
      )

    const [metadata] = await deprecated.MetadataProgram.findMetadataAccount(tokenMint);
    const txt = new Transaction()
      
    const depositInstructionAccounts = {
      wallet: new PublicKey(walletPublicKey),
      paymentAccount: new PublicKey(walletPublicKey),
      transferAuthority: new PublicKey(walletPublicKey),
      treasuryMint,
      escrowPaymentAccount,
      authority,
      auctionHouse,
      auctionHouseFeeAccount,
    }
    const depositInstructionArgs = {
      escrowPaymentBump,
      amount: buyerPrice,
    }

    const depositInstruction = createDepositInstruction(
      depositInstructionAccounts,
      depositInstructionArgs
    )

    const publicBuyInstruction = createPublicBuyInstruction(
      {
        wallet: new PublicKey(walletPublicKey),
        paymentAccount: new PublicKey(walletPublicKey),
        transferAuthority: new PublicKey(walletPublicKey),
        treasuryMint,
        tokenAccount,
        metadata,
        escrowPaymentAccount,
        authority,
        auctionHouse,
        auctionHouseFeeAccount,
        buyerTradeState,
      },
      {
        escrowPaymentBump,
        tradeStateBump,
        tokenSize: 1,
        buyerPrice,
      }
    )

    const [receipt, receiptBump] =
      await AuctionHouseProgram.findBidReceiptAddress(buyerTradeState)

    const printBidReceiptInstruction = createPrintBidReceiptInstruction(
      {
        receipt,
        bookkeeper: new PublicKey(walletPublicKey),
        instruction: SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        receiptBump,
      }
    )

    txt
      .add(depositInstruction)
      .add(publicBuyInstruction)
      .add(printBidReceiptInstruction)

    //txt.recentBlockhash = (await connection.getRecentBlockhash()).blockhash
    //txt.feePayer = new PublicKey(walletPublicKey)

    //let signed: Transaction | undefined = undefined
    /*
    try {
      signed = await signTransaction(txt)
    } catch (e: any) {
      //toast.error(e.message)
      return
    }*/

    let signature: string | undefined = undefined
    const transferAuthority = web3.Keypair.generate();
    const signers = true ? [] : [transferAuthority];

    let derivedMintPDA = await web3.PublicKey.findProgramAddress([Buffer.from((mintKey).toBuffer())], auctionHouseKey);
    let derivedBuyerPDA = await web3.PublicKey.findProgramAddress([Buffer.from((buyerWalletKey).toBuffer())], auctionHouseKey);
    let derivedOwnerPDA = await web3.PublicKey.findProgramAddress([Buffer.from((new PublicKey(mintOwner)).toBuffer())], auctionHouseKey);
  
    const GRAPE_AH_MEMO = {
      state:1, // status (0: withdraw, 1: offer, 2: listing, 3: buy/execute (from listing), 4: buy/execute(accept offer), 5: cancel)
      ah:auctionHouseKey.toString(), // pk
      mint:mintKey.toString(), // mint
      amount:buyerPrice // price
    };


    const instructions = txt.instructions;

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


    /*
    //execute BUY
    const buyPriceAdjusted = new BN(
      await getPriceWithMantissa(
          offerAmount,
          //@ts-ignore
          auctionHouseObj.treasuryMint,
          buyerWalletKey,
          anchorProgram,
      ),
    );

    const tokenSizeAdjusted = new BN(
      await getPriceWithMantissa(
          tokenSize,
          mintKey,
          buyerWalletKey,
          anchorProgram,
      ),
    ); 

    const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
      auctionHouseKey,
      buyerWalletKey, 
    );
    

    const results = await anchorProgram.provider.connection.getTokenLargestAccounts(mintKey);    
  
    //const tokenAccountKey: web3.PublicKey = tokenAccount ? new web3.PublicKey(tokenAccount) : results.value[0].address;
    const tokenAccountKey: web3.PublicKey = results.value[0].address;
     
    

    const [tradeState, tradeBump] = await getAuctionHouseTradeState(
      auctionHouseKey,
      buyerWalletKey,
      tokenAccountKey,
      //@ts-ignore
      auctionHouseObj.treasuryMint,
      treasuryMint,
      mintKey,
      tokenSizeAdjusted,
      buyPriceAdjusted,
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
    const signers = isNative ? [] : [transferAuthority];

    const instruction = anchorProgram.instruction.buy(
      tradeBump,
      escrowBump,
      buyPriceAdjusted,
      tokenSizeAdjusted,
      {
          accounts: {
              wallet: buyerWalletKey,
              paymentAccount: isNative ? buyerWalletKey : ata,
              transferAuthority: isNative ? web3.SystemProgram.programId : transferAuthority.publicKey,
              metadata: await getMetadata(mintKey),
              tokenAccount: tokenAccountKey,
              escrowPaymentAccount,
              //@ts-ignore
              treasuryMint: auctionHouseObj.treasuryMint,
              //@ts-ignore
              authority: auctionHouseObj.authority,
              auctionHouse: auctionHouseKey,
              //@ts-ignore
              auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
              buyerTradeState: tradeState,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: web3.SystemProgram.programId,
              rent: web3.SYSVAR_RENT_PUBKEY,
          },
      }
    );
    
    //const instructions = [instruction];
    const instructions = [
      ...(isNative
          ? []
          : [
              Token.createApproveInstruction(
                  TOKEN_PROGRAM_ID,
                  ata,
                  transferAuthority.publicKey,
                  buyerWalletKey, //walletKeyPair.publicKey, 
                  [],
                  buyPriceAdjusted.toNumber(),
              ),
          ]),
      instruction,
      ...(isNative
          ? []
          : [
              Token.createRevokeInstruction(
                  TOKEN_PROGRAM_ID,
                  ata,
                  buyerWalletKey, //walletKeyPair.publicKey, 
                  [],
              ),
          ]),
      ];
    //END BUY

    //CHECK IF DEPOSIT INSTRUCTTION IS NECESSARY
    if (escrowSolAmount > 0){
      //calculate how much more to deposit
      let depositAmount = 0;
      if (offerAmount < escrowSolAmount){
          depositAmount = offerAmount;
      } else {
          depositAmount = (offerAmount - (offerAmount - escrowSolAmount));
      }
      //console.log('depositAmount:', depositAmount);
      const amountAdjusted = await getPriceWithMantissa(
        depositAmount,
        //@ts-ignore
        auctionHouseObj.treasuryMint,
        buyerWalletKey,
        anchorProgram,
      );

      const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
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

      const instruction2 = anchorProgram.instruction.deposit(
        escrowBump,
        new BN(amountAdjusted),
        {
          accounts: {
            wallet: buyerWalletKey,
            paymentAccount: isNative ? buyerWalletKey : ata,
            transferAuthority: isNative
              ? web3.SystemProgram.programId
              : transferAuthority.publicKey,
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
          },
        },
      );
      instructions.push(instruction2);
    }
    // END ADDING DEPOSIT

    let derivedMintPDA = await web3.PublicKey.findProgramAddress([Buffer.from((mintKey).toBuffer())], auctionHouseKey);
    let derivedBuyerPDA = await web3.PublicKey.findProgramAddress([Buffer.from((buyerWalletKey).toBuffer())], auctionHouseKey);
    let derivedOwnerPDA = await web3.PublicKey.findProgramAddress([Buffer.from((new PublicKey(mintOwner)).toBuffer())], auctionHouseKey);
  
    const GRAPE_AH_MEMO = {
      state:1, // status (0: withdraw, 1: offer, 2: listing, 3: buy/execute (from listing), 4: buy/execute(accept offer), 5: cancel)
      ah:auctionHouseKey.toString(), // pk
      mint:mintKey.toString(), // mint
      amount:buyPriceAdjusted.toNumber() // price
    };

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
  
    */

  }