import React, { FC, ReactNode, useCallback, useMemo, Suspense } from 'react';
import { styled, ThemeProvider } from '@mui/material/styles';
import { HashRouter, BrowserRouter as Router, Route, Routes } from "react-router-dom";
//import { LogView } from "./Log/Log";
import { ProfileView } from "./Profile/Profile";
import { PreviewView } from "./Preview/Preview";
import { FeaturedView } from "./Featured/Featured";
import { IdentityView } from "./Identity/Identity";
import { SplashView } from "./Splash/Splash";
import CssBaseline from '@mui/material/CssBaseline';

import {
  Box,
  Grid,
  Paper,
  Container,
  Typography,
  AppBar,
} from '@mui/material';

import Header from './Header/Header';
import { SnackbarProvider } from 'notistack';
import { useConnection, ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, WalletError, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Connection, Keypair, SystemProgram, Transaction, clusterApiUrl } from '@solana/web3.js';
import { Helmet } from 'react-helmet';

import { useSnackbar } from 'notistack';

import ConfirmDialog from './components/ConfirmDialog/ConfirmDialog';

import { useTranslation } from 'react-i18next';

//import { WalletDialogProvider, WalletDisconnectButton, WalletMultiButton } from '../WalletAdapterMui';

/*
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
  //CloverWalletAdapter,
  //MathWalletAdapter,
  //Coin98WalletAdapter,
  //SolongWalletAdapter,
} from '@solana/wallet-adapter-wallets';
*/

import {
    getLedgerWallet,
    getPhantomWallet,
    getSlopeWallet,
    getSolflareWallet,
    getSolletExtensionWallet,
    getSolletWallet,
    //getTorusWallet,
  } from '@solana/wallet-adapter-wallets';


//import { mainListItems, secondaryListItems } from './components/SidebarList/SidebarList';
import grapeTheme from  './utils/config/theme'
import "./App.less";
import { STREAM_RPC_ENDPOINT, TX_RPC_ENDPOINT } from './utils/streamTools/constants';

function Copyright(props: any): JSX.Element {
  const { t, i18n } = useTranslation();
    return (
    <Typography sx={{background:'transparent'}} variant="body2" color="text.secondary" align="center" {...props}>
      {t('Powered by StreamDAO and Metaplex on Solana')}
      {/*
      <Link color="inherit" href="https://verify.stream.network">
        Stream Network | Dashboard v0.1.0
      </Link>
      */}
    </Typography>
  );
}


function DashboardContent() {
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  // You can also provide a custom RPC endpoint
  const network = WalletAdapterNetwork.Mainnet; //.Devnet; //.Mainnet;
  // You can also provide a custom RPC endpoint
  //const endpoint =  useMemo(() => clusterApiUrl(network), [network]); // STREAM_RPC_ENDPOINT;
  //const endpoint =  STREAM_RPC_ENDPOINT;
  const endpoint =  TX_RPC_ENDPOINT;
  const wallets = useMemo(() => [
  
    getPhantomWallet(),
    getSolflareWallet(),
    getSlopeWallet(),
    getSolletWallet({ network }),
    getSolletExtensionWallet({ network }),
    getLedgerWallet(),
  
    //getTorusWallet({
    //  options: { clientId: 'BCX2hQWDez2_qJhmSuQC7DXD4OG0VfGEFjCZfLar2EA5NvKyudCxOOlOcQ4YZbPGQhdwLonSXZr3i_siIJVhtwI' }
    //}),
  /*  
    new PhantomWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolflareWalletAdapter(),
    new TorusWalletAdapter(),
    new LedgerWalletAdapter(),
    new SolletWalletAdapter({ network }),
    new SolletExtensionWalletAdapter({ network }),
  */  
    //new CloverWalletAdapter(),
    //new MathWalletAdapter(),
    //new Coin98WalletAdapter(),
    //new SolongWalletAdapter(),
  ], [network]);
  
  /*
  const { enqueueSnackbar } = useSnackbar();
  const onError = useCallback(
      (error) => {
          enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
          console.error(error);
      },
      [enqueueSnackbar]
  );
  */

  return (
    <>
      <Suspense fallback="loading">
          <ThemeProvider theme={streamTheme}>
              <div className="stream-gradient-background">
              <SnackbarProvider>
                  <ConnectionProvider endpoint={endpoint}>
                      <WalletProvider wallets={wallets} autoConnect>
                      
                      <Grid 
                          //color={grapeTheme.palette.primary.light}
                          sx={{ 
                            flex: 1
                          }}>
                          <CssBaseline />
                          <Router>
                          <AppBar position="fixed" color="primary" style={{ background: 'rgba(0,0,0,0.5)' }}>
                              <Header
                                  open={open} 
                                  toggleDrawer={toggleDrawer}
                              />
                          </AppBar>
                              
                            <Grid
                              component="main"
                              sx={{
                                  mt: 6,
                                  display: 'flex',
                                  flexGrow: 1
                              }}
                              >
                              <Container maxWidth="lg" sx={{ mt: 4, mb: 4}}>
                                  <ConfirmDialog />
                                  <Routes>

                                    <Route path="/splash" element={<SplashView/>} />

                                    <Route path="/featured" element={<FeaturedView/>} />

                                    <Route path="/" element={<ProfileView/>}>
                                      <Route path=":handlekey" element={<ProfileView />} />
                                    </Route>
                                    <Route index element={<ProfileView/>} />
                                    
                                    <Route path="profile/*" element={<ProfileView />} >
                                        <Route path=":handlekey" element={<ProfileView />} />
                                    </Route>

                                    <Route path="collection/*" element={<ProfileView />} >
                                        <Route path=":handlekey" element={<ProfileView />} />
                                    </Route>
                                    
                                    <Route path="preview/*" element={<PreviewView />}>
                                        <Route path=":handlekey" element={<PreviewView />} />
                                    </Route>

                                    <Route path="identity/*" element={<IdentityView />}>
                                        <Route path=":handlekey" element={<IdentityView />} />
                                    </Route>

                                    <Route path="*" element={<NotFound />} />
                                  </Routes>
                                  
                                  <Copyright sx={{ mt: 4 }} />
                              </Container>
                            </Grid>
                          </Router>
                      </Grid>
                      
                      </WalletProvider>
                  </ConnectionProvider>
              </SnackbarProvider>
              </div>
          </ThemeProvider>
        </Suspense>
    </>
  );
}

export const NotFound = () => {
  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <Paper className="stream-paper-background">
        <Grid 
          className="stream-paper" 
          container
          alignContent="center"
          justifyContent="center"
          direction="column">
          <Grid item>
            <Typography 
              align="center"
              variant="h3">
              {'No Streams Here...'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
  </div>
  )
}

//export const Dashboard: FC<{ children: ReactNode }> = ({ children }) => {
export default function Dashboard() {
  return <DashboardContent />;
}