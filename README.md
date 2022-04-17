# Stream Art | Getting Started 

- This is the Stream Art Dex | A Social. Stateless. NFT Marketplace. Powered by Solana!

References:
- Metaplex Auction House (https://github.com/metaplex-foundation/metaplex)
- Realms/Governance (https://github.com/solana-labs/oyster/)

Wallet Adapter:
- Solana Wallet Adapter (https://github.com/solana-labs/wallet-adapter)

UI:
- Interface: MUI 5 https://mui.com

BUILD/START:
- `yarn install`
- `yarn start`

CONSTANTS: 
- Following should be edited according to the StreamDAO
-   `/utils/streamTools/constants.tsx`
-   `export const TOKEN_VERIFICATION_ADDRESS = '5P3giWpPBrVKL8QP8roKM7NsLdi3ie1Nc2b5r9mGtvwb';` // Stream Token to verify
-   `export const TOKEN_VERIFICATION_NAME = 'Stream';`
-   `export const TOKEN_VERIFICATION_AMOUNT = 1000;` // This is to verify the amount needed to make an offer
-   `export const TOKEN_REALM_ID = 'By2sVGZXwfQq6rAiAM3rNPJ9iQfb5e2QhnF4YjJ4Bip';` // governance/realms publicKey to capture if the wallet has holdings also on realms and account for that in the verification
-   IMPORTANT:
-   * connection endpoint can be edited in the `utils/streamTools/constants.tsx`
-   * Default AH is set with 0% fees


HELP SETTING UP:
-   Have a DAO and want to run an instance of stream.art? Reach out to the Stream Team at https://discord.gg/

TRY IT OUT NOW:
- https://stream.art


<img width="1219" alt="Screen Shot 2022-02-21 at 2 38 32 AM" src="https://user-images.githubusercontent.com/13381905/154965216-e03620b9-d783-4f7d-9b55-c4e21ec90879.png">
