export const TX_RPC_ENDPOINT = process.env.REACT_APP_API_TX_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
export const STREAM_RPC_ENDPOINT = process.env.REACT_APP_API_GRAPE_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';

//export const STREAM_PREVIEW = '/preview/';
//export const STREAM_PROFILE = '/profile/';
//export const STREAM_IDENTITY = '/identity/';

export const STREAM_PREVIEW = '/preview?pkey=';
export const STREAM_PROFILE = '/profile?pkey=';
export const STREAM_IDENTITY = '/identity?pkey=';

export const STREAM_RPC_REFRESH = 25000;
export const STREAM_TREASURY = 'HQ9xdik6TD9wJHFDxQHoSJ4U9HWGP3xfVXLNDG3m2h7y';

export const MARKET_LOGO = '/stream_white_logo.svg';

export const TOKEN_VERIFICATION_ADDRESS = '5P3giWpPBrVKL8QP8roKM7NsLdi3ie1Nc2b5r9mGtvwb';
export const TOKEN_VERIFICATION_NAME = 'Stream';
export const TOKEN_VERIFICATION_AMOUNT = 1000;
export const TOKEN_REPORT_AMOUNT = 10;
export const REPORT_ALERT_THRESHOLD = 1;
export const TOKEN_REALM_ID = 'By2sVGZXwfQq6rAiAM3rNPJ9iQfb5e2QhnF4YjJ4Bip';
export const TOKEN_REALM_PROGRAM_ID = 'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw';

export const VERIFIED_COLLECTION_ARRAY = [{
    address:'',
    name:'',
    status:1,// mint status (0:minting, 1:completed)
    size:0,
    description:'',
    links:{
        url:'',
        discord:'',
        twitter:'',
        instagram:'',
    },
    logo:'',
    splash:'',
}]

export const VERIFIED_DAO_ARRAY = [
    {
        address:'JAbgQLj9MoJ2Kvie8t8Y6z6as3Epf7rDp87Po3wFwrNK',
        solTreasury: '5UFKrfJkaWp45b8Kn82bXgokaKrzfVkoM1LBoHHk78wn',
        realmPK: 'DcR6g5EawaEoTRYcnuBjtD26VSVjWNoi1C1hKJWwvcup'
    },{
        address:'9fxVRxEqgMXRnNFePLVbbWTePs2pPQSSpbq6ZgZN4LBG',
        solTreasury: '5xZeVxC2UDnd64bgC3cZQoM38WwUi6T46SvTqUbShuAX',
        realmPK: 'DcR6g5EawaEoTRYcnuBjtD26VSVjWNoi1C1hKJWwvcup'
    }
]

export const FEATURED_DAO_ARRAY = [{
    address:'66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV',
    daourl:'https://realms.today/dao/Ukraine',
    img:'/solana4ukraine.png',
    title:'Solana for Ukraine',
    text:'NFT Artists come together in the DAO made exlusively to help out Ukraine, all proceeds of these NFT\'s will be donated to help the Ukrainian people'
}]

export const OTHER_MARKETPLACES = new Array(
    {
        name: 'Magic Eden',
        logo: 'https://magiceden.io/static/media/logo.ca418d75.svg',
        //logo: 'https://magiceden.io/img/logo.png',
        address: 'GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp',
        previewUrl: 'https://www.magiceden.io/item-details/',
        url: 'https://www.magiceden.io'
    },{
        name: 'SolanArt',
        logo: 'https://solanart.io/static/media/logo.0054f7e7.png',
        address: '3D49QorJyNaL4rcpiynbuS3pRH4Y7EXEM6v6ZGaqfFGK',
        previewUrl: 'https://solanart.io/search/?token=',
        url: 'https://solanart.io'
    },{
        name: 'Digital Eyes',
        logo: 'https://ik.imagekit.io/srjnqnjbpn9/logo/digitaleyes.svg?ik-sdk-version=react-1.0.11',
        //logo: 'https://ik.imagekit.io/favicon-32x32.png',
        address: 'F4ghBzHFNgJxV4wEQDchU5i7n4XWWMBSaq7CuswGiVsr',
        previewUrl: '',
        url: 'https://www.magiceden.io'
    },{
        name: 'Digital Eyes',
        logo: 'https://ik.imagekit.io/srjnqnjbpn9/logo/digitaleyes.svg?ik-sdk-version=react-1.0.11',
        //logo: 'https://ik.imagekit.io/srjnqnjbpn9/logo/favicon-32x32.png',
        address: 'BweTPKW9QsWZTJnfbLz88ekKaWw7HrBJsStrduHryPgk',
        previewUrl: '',
        url: 'https://www.magiceden.io'
    },{
        name: 'Alph Art',
        //logo: 'https://alpha.art/icon-root.svg',
        logo: 'https://alpha.art/logo_192.png',
        address: '4pUQS4Jo2dsfWzt3VgHXy3H6RYnEDd11oWPiaM2rdAPw',
        previewUrl: 'https://alpha.art/t/',
        url: 'https://www.alpha.art'
    },{
        name: 'FTX',
        logo: 'https://ftx.us/static/media/ftxus_logo_white.b384ac52.svg',
        address: '73tF8uN3BwVzUzwETv59WNAafuEBct2zTgYbYXLggQiU',
        previewUrl: '',
        url: 'https://ftx.us/nfts'
    },{
        name: 'FTX',
        logo: 'https://ftx.us/static/media/ftxus_logo_white.b384ac52.svg',
        address: 'HHvnfyY7vNWhjeHqCVyMPr4UjDp3ptqu3QbuFoCkrm8r',
        previewUrl: '',
        url: 'https://ftx.us/nfts'
    },{
        name: 'FTX',
        logo: 'https://ftx.us/static/media/ftxus_logo_white.b384ac52.svg',
        address: 'HznNaC2cz1iXMtHMG3HAgMH2xkrt2iTXfUKz6wwAAVPB',
        previewUrl: '',
        url: 'https://ftx.us/nfts'
    },{
        name: 'SMB Market',
        //logo: 'https://market.solanamonkey.business/logo/smb-market.svg',
        logo: 'https://market.solanamonkey.business/logo/smb.png',
        address: 'G6xptnrkj4bxg9H9ZyPzmAnNsGghSxZ7oBCL1KNKJUza',
        previewUrl: 'https://market.solanamonkey.business/item/',
        url: 'https://market.solanamonkey.business/'
    },{
        name: 'SMB Market',
        //logo: 'https://market.solanamonkey.business/logo/smb-market.svg',
        logo: 'https://market.solanamonkey.business/logo/smb.png',
        address: '7Ppgch9d4XRAygVNJP4bDkc7V6htYXGfghX4zzG9r4cH',
        previewUrl: 'https://market.solanamonkey.business/item/',
        url: 'https://market.solanamonkey.business/'
    },{
        name: 'SMB Market',
        //logo: 'https://market.solanamonkey.business/logo/smb-market.svg',
        logo: 'https://market.solanamonkey.business/logo/smb.png',
        address: 'EQEpTS8SiVPUxyqRgT2Jdx9dHEwbpcbSZ2sotiAUZ7i7',
        previewUrl: 'https://market.solanamonkey.business/item/',
        url: 'https://market.solanamonkey.business/'
    },{
        name: 'SMB Market',
        //logo: 'https://market.solanamonkey.business/logo/smb-market.svg',
        logo: 'https://market.solanamonkey.business/logo/smb.png',
        address: 'CPo76cw52gKMTyvCS9GpnnZfvmkQQxovLwQFxonZrCRU',
        previewUrl: 'https://market.solanamonkey.business/item/',
        url: 'https://market.solanamonkey.business/'
    }
);