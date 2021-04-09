import React from 'react';
import './styles/navbar.css';
import '../App.css';
import { AppBar, Button, Grid, IconButton, InputBase, makeStyles, Modal, Paper, Typography, useTheme } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import { useHistory } from 'react-router';
import { StoreContext } from '../util/store';
import ProductMenuButton from './ProductMenuButton';
import BaliExpress from '../assets/BaliExpress.png';
import SearchBar from './searchBar';
import BuildModalForm from './buildPageComponents/BuildModalForm';
import { buildTemplate } from '../util/helpers';

import API from '../util/API';
const api = new API();
const useStyles = makeStyles((theme) => ({
    root: {
        background: 'rgb(38,40,64)'
    },
    searchBar: {
        padding: '0.2em',
    },
}))
const NavBar = () => {
    const context = React.useContext(StoreContext)
    const { build: [,setBuild] } = context;
    const [buildOpen, setBuildOpen] = React.useState(false);
    const [loginStatus, setLoginStatus] = React.useState("");
    const history = useHistory();
    const classes = useStyles();
    const theme = useTheme();
    // handle click of the profile icon
    // if user isnt logged in redirect to login page, otherwise send them to profile page
    const handleProfileClick = () => {
        const userId = localStorage.getItem('userId');
        if(!userId){
            history.push('/login');
        } else {
            console.log(`user id is ${userId}`);
            history.push(`/profile/${userId}`);
        }
    }
    const redirectHomepage = () => {
        history.push('/');
    }
    
    const handleBuildClick = () => {
        setBuild(buildTemplate);
        setBuildOpen(true);
    
    }
    React.useEffect(() => {
        (async () => {
            const userId = localStorage.getItem('userId');
            if(userId){
                const options = {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Request-Type': 'profile',
                    },
                }
                const response = await api.makeAPIRequest(`profile?userId=${userId}`, options);
                const userDetails = response.accountInfo;
                const userAccInfo = {name: userDetails.name, 
                    email: userDetails.email, 
                    phonenumber: userDetails.phonenumber,
                    password: userDetails.password,
                    isAdmin: userDetails.admin}
                if(userAccInfo.isAdmin){
                    setLoginStatus(`Admin: (${userAccInfo.email})`);
                }else{
                    setLoginStatus(`User: (${userAccInfo.email})`);
                }
            }else{
                setLoginStatus("Guest");
            }
        })();
    },[])

    return (
        <header>
            <AppBar className={classes.root}>
                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                >
                    <img 
                        src={BaliExpress} 
                        alt="logo" 
                        className="navbar-logo"
                        onClick={() => redirectHomepage()}
                    />
                    <Grid item xs={1}>
                        <ProductMenuButton/>
                    </Grid>
                    <Grid item xs={1}>
                        <Button onClick={() => {handleBuildClick();}}>Build-A-PC</Button>
                        <Modal 
                            open={buildOpen}
                            onClose={() => {setBuildOpen(false)}}
                        >
                            <BuildModalForm handleToggle={setBuildOpen} setOpen={setBuildOpen}/>
                        </Modal>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper>
                            <SearchBar/>
                        </Paper>
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton onClick={() => handleProfileClick()}>
                            <AccountCircleIcon fontSize="large"/>
                        </IconButton>
                        <Typography className="login-status-text">
                            {loginStatus}
                        </Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <ShoppingCartIcon fontSize="large" />
                        <Typography>(0)</Typography>
                    </Grid>
                </Grid>
            </AppBar>
        </header>
    )
}

export default NavBar;