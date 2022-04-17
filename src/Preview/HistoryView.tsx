import React from "react";
import { Link } from "react-router-dom";

import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BN, web3 } from '@project-serum/anchor';
//import spok from 'spok';

import moment from 'moment';

import {
    Typography,
    Grid,
    Box,
    Button,
    ButtonGroup,
    Skeleton,
    Collapse,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    InputBase,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';

import {
    AUCTION_HOUSE_PROGRAM_ID,
    ENV_AH,
    AUCTION_HOUSE_ADDRESS,
    WRAPPED_SOL_MINT,
    TOKEN_PROGRAM_ID,
} from '../utils/auctionHouse/helpers/constants';

import { AuctionHouseProgram  } from '@metaplex-foundation/mpl-auction-house';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

import { 
    STREAM_RPC_ENDPOINT,
    STREAM_PROFILE,
} from '../utils/streamTools/constants';

import { MakeLinkableAddress, ValidateCurve, trimAddress, timeAgo, formatBlockTime } from '../utils/streamTools/WalletAddress'; // global key handling

import { TokenAmount } from '../utils/streamTools/safe-math';

import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import SolCurrencyIcon from '../components/static/SolCurrencyIcon';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BallotIcon from '@mui/icons-material/Ballot';
import SellIcon from '@mui/icons-material/Sell';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CircularProgress from '@mui/material/CircularProgress';
import CancelIcon from '@mui/icons-material/Cancel';
import { ConstructionOutlined, SentimentSatisfiedSharp } from "@mui/icons-material";

function convertSolVal(sol: any){
    try{
        sol = parseFloat(new TokenAmount(sol, 9).format()).toFixed(4);
    }catch(e){console.log("ERR: "+e)}
    return sol;
}

export default function HistoryView(props: any){
    const [history, setHistory] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [open_history_collapse, setOpenHistoryCollapse] = React.useState(false);
    const [openHistory, setOpenHistory] = React.useState(0);
    const [historyME, setMEHistory] = React.useState(null);
    const [statsME, setMEStats] = React.useState(null);
    const [openMEHistory, setMEOpenHistory] = React.useState(0);
    const [me_open_history_collapse, setMEOpenHistoryCollapse] = React.useState(false);
    const [mint, setMint] = React.useState(props.mint || null);
    const [symbol, setSymbol] = React.useState(props.symbol || null);
    const ggoconnection = new Connection(STREAM_RPC_ENDPOINT);
    const { connection } = useConnection();

    const [receiptListing, setReceiptListing] = React.useState(null);
    const [receiptPurchase, setReceiptPurchase] = React.useState(null);
    const [receiptBid, setReceiptBid] = React.useState(null);
    const [receipts, setReceipts] = React.useState(null);

    const handleMEClick = () => {
        setMEOpenHistoryCollapse(!me_open_history_collapse);
    }

    const handleClick = () => {
        setOpenHistoryCollapse(!open_history_collapse);
    }

    const getMEStats = async () => {
        setLoading(true);

        if (mint){
            let response = null;

            const apiUrl = "https://api-mainnet.magiceden.dev/v2/collections/"+symbol+"/stats";
            
            const resp = await fetch(apiUrl, {
                method: 'GET',
                redirect: 'follow',
                //body: JSON.stringify(body),
                //headers: { "Content-Type": "application/json" },
            })

            const json = await resp.json();
            //console.log("json: "+JSON.stringify(json));
            setMEStats(json);
        }
        setLoading(false);
    }

    const getMEHistory = async () => {
        
        setLoading(true);
        
        if (mint){
            let response = null;

            const apiUrl = "https://api-mainnet.magiceden.dev/v2/tokens/"+mint+"/activities?offset=0&limit=100";
            
            const resp = await fetch(apiUrl, {
                method: 'GET',
                redirect: 'follow',
                //body: JSON.stringify(body),
                //headers: { "Content-Type": "application/json" },
            })

            const json = await resp.json();
            //console.log("json: "+JSON.stringify(json));
            try{
                // here get the last sale and show it:
                // stream-art-last-sale
                
                let found = false;
                for (var item of json){
                    //console.log(item.type + ' ' + item.price + ' '+formatBlockTime(item.blockTime, true, true));
                    if (item.type === "buyNow"){
                        let elements = document.getElementById("stream-art-last-sale");
                        if (!found){
                            //elements.innerHTML = 'Last sale '+item.price+'sol on '+formatBlockTime(item.blockTime, true, false);
                        }
                        found = true;
                    }
                }
            }catch(e){console.log("ERR: "+e);return null;}

            setMEHistory(json);
            setMEOpenHistory(json.length);
        }
        setLoading(false);
    }

    const getHistory = async () => {
        setLoading(true);
        //const AuctionHouseProgram = await ggoconnection.AuctionHouseProgram(new PublicKey(ENV_AH)); // loadAuctionHouseProgram(null, ENV_AH, STREAM_RPC_ENDPOINT);
        //const AuctionHouseProgram =  AuctionHouse.fromAccountAddress(ggoconnection, new PublicKey(ENV_AH)); //.fromAccountInfo(info)[0];
        
        //AuctionHouseProgram.LISTINE_RECEIPT

        //const AHP = await AuctionHouseProgram;
        //spok(t, AuctionHouseProgram, expected);
        
        if (mint){
            
            const _mint = new PublicKey(mint);
            //const metadata = await Metadata.findByMint(ggoconnection, _mint);
            
            //const [metadata_program] = await Metadata.fromAccountAddress(tokenMint)
            
            console.log("Receipts: "+JSON.stringify(receipts));
            //setOpenHistory(receipts.length);
            //setReceipts(receipts);
            
            //const confirmedsignatures = await ggoconnection.getConfirmedSignaturesForAddress2(new PublicKey(mint), {"limit":25});
            //const listingreceipts = await ggoconnection.getConfirmedSignaturesForAddress2(new PublicKey(mint), {"limit":25});
            
            //setHistory(nftSales);
            //setOpenHistory(nftSales.length);
        }
        setLoading(false);
    }

    React.useEffect(() => {
        if (mint){
            //if (!history){
                getHistory();
                //getMEHistory();
            //}
        }
    }, [mint]);

    if (loading){
        /*return <></>*/
        
        return (
            <Box
                sx={{ 
                    p: 1, 
                    mb: 3, 
                    width: '100%',
                    background: '#00061A',
                    borderRadius: '24px'
                }}
            > 
                <Skeleton
                    sx={{ 
                        height: '100%',
                        width: '100%'
                    }}
                />
            </Box>
        )
    } else{  

        return ( 
            <>
                {historyME && historyME.length > 0 &&
                    <Box
                        sx={{ 
                            p: 1, 
                            mb: 3, 
                            width: '100%',
                            background: '#00061A',
                            borderRadius: '24px'
                        }}
                    > 
                        <ListItemButton onClick={handleMEClick}
                            sx={{borderRadius:'20px'}}
                        >
                            <ListItemIcon>
                            <BarChartOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText 
                                primary='History'
                            />
                                <Typography variant="caption"><strong>{openMEHistory}</strong></Typography>
                                {me_open_history_collapse ? <ExpandLess /> : <ExpandMoreIcon />}
                        </ListItemButton>
                        <Collapse in={me_open_history_collapse} timeout="auto" unmountOnExit>
                            <List component="div" 
                                sx={{ 
                                    width: '100%',
                                }}>
                                <ListItemText>
                                    <Box sx={{ margin: 1 }}>
                                        {/*<div style={{width: 'auto', overflowX: 'scroll'}}>*/}
                                        <TableContainer>
                                            <Table size="small" aria-label="purchases">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell><Typography variant="caption">Source</Typography></TableCell>
                                                        <TableCell><Typography variant="caption">Owner</Typography></TableCell>
                                                        <TableCell align="center"><Typography variant="caption">Amount</Typography></TableCell>
                                                        <TableCell align="center"><Typography variant="caption">Date</Typography></TableCell>
                                                        <TableCell>Signature</TableCell>
                                                    </TableRow>

                                                </TableHead>

                                                <TableBody>
                                                    {historyME && historyME.map((item: any) => (
                                                        <>
                                                            {//item.buyer &&
                                                            <TableRow>
                                                                <TableCell>
                                                                    {item.seller ?
                                                                        <Button size="small" variant="text" component={Link} to={`${STREAM_PROFILE}${item.seller}`} target="_blank" sx={{ml:1,color:'white',borderRadius:'24px'}}>
                                                                            {trimAddress(item.seller,3)}
                                                                        </Button>   
                                                                    :
                                                                        <Typography variant="body2" sx={{textAlign:'center'}}>
                                                                            {item.type.toLocaleUpperCase()}
                                                                        </Typography>
                                                                    } 
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.buyer ?
                                                                        <Button size="small" variant="text" component={Link} to={`${STREAM_PROFILE}${item.buyer}`} target="_blank" sx={{ml:1,color:'white',borderRadius:'24px'}}>
                                                                            {trimAddress(item.buyer,3)}
                                                                        </Button>
                                                                    :    
                                                                        <Typography variant="body2" sx={{textAlign:'center'}}>
                                                                            {item.type.toLocaleUpperCase()}
                                                                        </Typography>
                                                                    }    
                                                                </TableCell>
                                                                <TableCell  align="right">
                                                                        <Typography variant="body2">
                                                                            {item.price} <SolCurrencyIcon sx={{fontSize:"10.5px"}} />
                                                                        </Typography>
                                                                    </TableCell>
                                                                <TableCell align="right">
                                                                    <Typography variant="caption">
                                                                        <Tooltip
                                                                            title={formatBlockTime(item.blockTime, true, true)}
                                                                        >
                                                                            <Button size="small">{timeAgo(item.blockTime)}</Button>
                                                                        </Tooltip>
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button size="small" variant="text" component="a" href={`https://explorer.solana.com/tx/${item.signature}`} target="_blank" sx={{ml:1,color:'white',borderRadius:'24px'}}>
                                                                        {trimAddress(item.signature,3)}
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                            }
                                                        </>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                </ListItemText>
                            </List>
                        </Collapse>
                    </Box>
                }
                {history && history.length > 0 &&
                    <Box
                        sx={{ 
                            p: 1, 
                            mb: 3, 
                            width: '100%',
                            background: '#00061A',
                            borderRadius: '24px'
                        }}
                    > 
                        <ListItemButton onClick={handleClick}
                            sx={{borderRadius:'20px'}}
                        >
                            <ListItemIcon>
                            <BarChartOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText 
                                primary='History'
                            />
                                <Typography variant="caption"><strong>{openHistory}</strong></Typography>
                                {open_history_collapse ? <ExpandLess /> : <ExpandMoreIcon />}
                        </ListItemButton>
                        <Collapse in={open_history_collapse} timeout="auto" unmountOnExit>
                            <List component="div" 
                                sx={{ 
                                    width: '100%',
                                }}>
                                <ListItemText>
                                    <Box sx={{ margin: 1 }}>
                                        {/*<div style={{width: 'auto', overflowX: 'scroll'}}>*/}
                                        <TableContainer>
                                            <Table size="small" aria-label="purchases">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell><Typography variant="caption">Type</Typography></TableCell>
                                                        <TableCell><Typography variant="caption">Owner</Typography></TableCell>
                                                        <TableCell align="center"><Typography variant="caption">Amount</Typography></TableCell>
                                                        <TableCell align="center"><Typography variant="caption">Date</Typography></TableCell>
                                                        <TableCell>Signature</TableCell>
                                                    </TableRow>

                                                </TableHead>

                                                <TableBody>
                                                    {history && history.map((item: any) => (
                                                        <TableRow>
                                                            
                                                            
                                                            <TableCell>
                                                                {item.source ?
                                                                    <Button size="small" variant="text" component={Link} to={`${STREAM_PROFILE}${item?.source}`} target="_blank" sx={{ml:1,color:'white',borderRadius:'24px'}}>
                                                                        {trimAddress(item.source,3)}
                                                                    </Button>   
                                                                :
                                                                    <Typography variant="body2" sx={{textAlign:'center'}}>
                                                                        {item.type.toLocaleUpperCase()}
                                                                    </Typography>
                                                                }   
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.owner ?
                                                                <Button size="small" variant="text" component={Link} to={`${STREAM_PROFILE}${item?.owner}`} target="_blank" sx={{ml:1,color:'white',borderRadius:'24px'}}>
                                                                    {trimAddress(item?.owner,3)}
                                                                </Button>
                                                                :    
                                                                    <Typography variant="body2" sx={{textAlign:'center'}}>
                                                                        {item?.type.toLocaleUpperCase()}
                                                                    </Typography>
                                                                
                                                                }    
                                                            </TableCell>
                                                            <TableCell  align="right">
                                                                    <Typography variant="body2">
                                                                        {convertSolVal(item?.amount)} <SolCurrencyIcon sx={{fontSize:"10.5px"}} />
                                                                    </Typography>
                                                                </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="caption">
                                                                    <Tooltip
                                                                        title={formatBlockTime(item.blockTime, true, true)}
                                                                    >
                                                                        <Button size="small">{timeAgo(item?.blockTime)}</Button>
                                                                    </Tooltip>
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button size="small" variant="text" component="a" href={`https://explorer.solana.com/tx/${item?.signature}`} target="_blank" sx={{ml:1,color:'white',borderRadius:'24px'}}>
                                                                    {trimAddress(item?.signature,3)}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                </ListItemText>
                            </List>
                        </Collapse>
                    </Box>
                }
            </>
        )
    }

}