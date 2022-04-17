import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Link, useLocation, NavLink } from 'react-router-dom';

import { STREAM_PREVIEW, STREAM_PROFILE, FEATURED_DAO_ARRAY } from '../utils/streamTools/constants';

import {
    Grid,
    Button,
    ButtonGroup,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
} from '@mui/material';

import ShareSocialURL from '../utils/streamTools/ShareUrl';
import { MakeLinkableAddress, ValidateAddress, trimAddress, timeAgo } from '../utils/streamTools/WalletAddress'; // global key handling

import { CardActionArea } from '@mui/material';

import { useTranslation } from 'react-i18next';

export function FeaturedView(props: any) {

const { t, i18n } = useTranslation();
    
  return (
        <>
            {FEATURED_DAO_ARRAY.map((featured: any, key: number) => (
            <Card sx={{borderRadius:'26px',mb:2}}>
                <CardActionArea
                    component={Link} to={`${STREAM_PROFILE}${featured.address}`}
                >
                    
                    <CardMedia
                        component="img"
                        image={featured.img}
                        alt={featured.title}
                            sx={{
                                maxHeight: '250',
                                background: 'rgba(0, 0, 0, 1)',
                                m:0,
                                p:0,
                            }} 
                        />
                        
                    <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {featured.title}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                        {featured.text}
                    </Typography>
                        <img
                            src={featured.img}
                            alt=""
                            style={{
                                opacity: '0.025',
                                position: 'absolute',
                                marginTop:2,
                                marginBottom:2,
                                padding:1,
                                top:'-20%',
                                left:'-20%',
                                width:'150%'
                            }}
                        />
                    </CardContent>
                
                </CardActionArea>
                <CardActions>
                    <Grid 
                        container
                        direction="row"
                        justifyContent='flex-end'
                        alignContent='flex-end'
                        sx={{
                            p:1,pr:1.25
                        }}
                    >
                        <ButtonGroup variant="text">
                            <Button size="small" 
                                component="a" href={`${featured.daourl}`} target="_blank"
                                sx={{borderRadius:'24px', color:'white'}}>
                                {t('View StreamDAO')}</Button>
                            <Button size="small"    
                                component={Link} to={`${STREAM_PROFILE}${featured.address}`}
                                sx={{borderRadius:'24px', color:'white'}}
                            >{t('View Collection')}</Button>
                            <ShareSocialURL url={'https://STREAM.ART'+STREAM_PROFILE+featured.address} title={'StreamDAO Profile | '+trimAddress(featured.address,4)} />
                        </ButtonGroup>
                    </Grid>
                </CardActions>
            </Card> 
            ))}
        </>
  );
}