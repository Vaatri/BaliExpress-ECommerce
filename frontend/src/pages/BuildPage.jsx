import { AppBar, Button, Checkbox, FormControlLabel, Grid, LinearProgress, makeStyles, Modal, Snackbar, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import { useHistory } from 'react-router';
import BuildProductCard from '../components/buildPageComponents/BuildProductCard';
import SaveBuildModal from '../components/buildPageComponents/SaveBuildModal';
import API from '../util/API';
import { buildTemplate } from '../util/helpers';
import { StoreContext } from '../util/store';

const api = new API();

const useStyles = makeStyles(() => ({
    root: {
        margin: '0 10% 5% 10%'
    },
    footerBar: {
        top: 'auto',
        bottom: 0,
        padding: '1em',
        background: 'rgb(25,25,25)',
        zIndex: 1,
    },
    standoutButton: {
        background: 'rgb(245,245,0)',
    },
}))

const BuildPage = () => {
    
    const context = React.useContext(StoreContext)
    const {userType: [userType]} = context;
    const { build: [build, setBuild]} = context;
    const { cart: [cart, setCart] } = context;
    const [buildPrice, setBuildPrice] = React.useState(0);
    const [buildName, setBuildName] = React.useState('Your Custom Built PC');
    // modal states
    const [open, setOpen] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [successType, setSuccessType] = React.useState('');
    const history = useHistory();
    const classes = useStyles();
    const [builtByCompany, setBuiltByCompany] = React.useState(false)
    const [buildError, setBuildError] = React.useState({error: false, message: ''});
    const [loadingBuild, setLoadingBuild] = React.useState('idle');
    
    // Generate a build if required 
    React.useEffect(() => {
        // set the build according to the entry point to the build page
        if (history.location.state.type === 'empty') {
            const newBuild = JSON.parse(JSON.stringify(buildTemplate));
            setBuild(newBuild);
        //if its a custom built pc
        } else if (history.location.state.type.includes('custom')){
            //get the specs
            const formResponse = history.location.state.specs;
            // set the loading bar so it appears
            setLoadingBuild('loading');
            // get the actual custom build
            api.get(`build?usage=${formResponse.usage}&&budget=${formResponse.budget}&&overclock=${formResponse.overclock}&&storage=${formResponse.storage}`)
            .then((res) => {
                // flag to determine if theres an error/if backend couldnt find an appriopriate part
                let flag = false;
                let errorMessage = "Sorry, we couldn't find these products within your budget and usage : "
                // loop through th e parts and see if theres any empty parts
                Object.keys(res).forEach((part) => {
                    if(res[part] === '' && part !== 'CPU_Cooling'){
                        errorMessage += part + '';
                        flag = true;
                    }
                })
                if(flag) {
                    setBuildError({error: true, message: errorMessage});
                }
                const newBuild = JSON.parse(JSON.stringify(build));
                newBuild.parts = res;
                newBuild.name = "Your Custom PC Build"
                newBuild.id = 0;
                setBuild(newBuild);
        
            })
            .then(() => {
                setLoadingBuild('done');
            })
        } else if (history.location.state.type === 'edit') {
            console.log(history.location.state.name)
            setBuildName(history.location.state.name);
        }
    },[history.location.state.type, history.location.state.count])
    
    // generate and calculate the build price
    React.useEffect(() => {
        let newPrice = Object.keys(build.parts).reduce((previous, key) => {
            console.log(build.parts[key])
            if(build.parts[key].price){
                if(build.parts[key].sale) {
                    previous.price = Number(build.parts[key].price) * ( 1 - Number(build.parts[key].sale.salepercent)/100);    
                } else {
                    previous.price += Number(build.parts[key].price);
                }
            }
            return previous;
        }, { price: 0 });
        if (builtByCompany){
            newPrice.price += 50
        }
        setBuildPrice(newPrice.price);
    },[build, builtByCompany])
    
    
    
    const handleAddToCart = () => {
        const buildInfo = JSON.parse(JSON.stringify(build));
        buildInfo['price'] = buildPrice;
        buildInfo['quantity'] = 1;
        buildInfo['builtByCompany'] = builtByCompany;
        
        const updatedCart = JSON.parse(JSON.stringify(cart));
        console.log(buildInfo);
        updatedCart.push(buildInfo);
        setSuccessType('cart');
        setSuccess(true);
        setCart(updatedCart);
    }
    
    const handleSaveBuild = (event) => {
        setSuccessType('save');
        setOpen(true);
    }
    
    return (
    <div className={classes.root}>
        <Grid container alignItems="center" direction="column" spacing={3} className="light-text">
            <Grid item>
                <Typography className="light-text" variant="h2" >Custom PC Builder</Typography>
            </Grid>
            {loadingBuild === 'loading' && 
                <Grid xs={12}>
                    <LinearProgress />
                    <Typography>Loading build...</Typography>
                </Grid>
            }
            <Grid container item direction="row">
                <Grid container item direction="column" xs={12} spacing={3}>
                    {Object.keys(build.parts).map((category) => (
                        <Grid item key={`${category}-card`}>
                            <BuildProductCard type={category} />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
        <AppBar position="fixed" color="primary" className={classes.footerBar}>
            <Grid container direction="row" alignItems="center" justify="space-around">
                <Grid container item direction="column" xs={2}>
                    <Grid item>
                        <Typography className="light-text" >Build Number: {`${build.id}`}</Typography>
                    </Grid>
                    <Grid item>
                        <FormControlLabel
                            control = {
                                <Checkbox checked={builtByCompany} onChange={() => {builtByCompany ? setBuiltByCompany(false) : setBuiltByCompany(true)}} />
                            }
                            label = "Built by Company" className="light-text"
                        />
                    </Grid>
                </Grid>
                <Grid item xs={1}>
                    <Typography className="light-text" variant="h3">${buildPrice.toFixed(2)}</Typography>
                </Grid>
                <Grid container item direction="row" xs={3}>
                    <Grid item xs={6}>
                        <Button className={classes.standoutButton} variant="contained" onClick={handleSaveBuild} disabled={userType.toLowerCase() === 'guest'}>Save build</Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button className={classes.standoutButton} variant="contained" onClick={() => {handleAddToCart()}}>Add to Cart</Button>
                    </Grid>
                </Grid>
                <Grid item xs={3}>
                    <Typography className="light-text" variant="caption">Dispatch will take 7-10 Business Days. If opted to be built, it will take an extra 7 business days.</Typography>
                </Grid>
            </Grid>
            <Modal open={open} onClose={() => {setOpen(false)}}>
                <SaveBuildModal build={build} setSuccess={setSuccess} setOpen={setOpen} edit={build.id}/>
            </Modal>
        </AppBar>
        <Snackbar open={buildError.error} autoHideDuration={10000} onClose={() => {setBuildError({error: false, message: ''})}}>
            <Alert severity="warning">{buildError.message}</Alert>
        </Snackbar>
        <Snackbar open={success} autoHideDuration={5000} onClose={() => {setSuccess(false)}}>
            <Alert severity="success">{successType === 'save' ? 'Build Successfully Saved!' : 'Build added to cart!'}</Alert>
        </Snackbar>
    </div>
    )
}

export default BuildPage;