import { Accordion, AccordionDetails, AccordionSummary, Button, Card, CardMedia, CssBaseline, Divider, Grid, makeStyles, Modal, ThemeProvider, Tooltip, Typography } from '@material-ui/core';
import React from 'react';
import InfoIcon from '@material-ui/icons/Info';
import SelectBuildProductModal from './SelectBuildProductModal';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { StoreContext } from '../../util/store';
import { productDesc } from '../../util/helpers';

const useStyles = makeStyles((theme) => ({
    productInfoContainer: {
        padding: theme.spacing(2)
    },
    image: {
        width: '100%',
    },
    salePrice: {
        fontWeight: 'bold',
    },
    oldSalePrice: {
        textDecoration: 'line-through',
    }
}));

const BuildProductCard = ({type}) => {
    const context = React.useContext(StoreContext)
    const [open, setOpen] = React.useState(false);
    const {build: [build, setBuild]} = context;
    const [productInfo, setProductInfo] = React.useState(build.parts[type]);
    const [redirect, setRedirect] = React.useState('')
    const classes = useStyles();
    
    
    
    
    // when user selects a product for the build, build state and productInfo state
    const handleCardUpdate = (type, product) => {
        
        // make a deep copy of build
        const updatedBuild = JSON.parse(JSON.stringify(build));
        updatedBuild.parts[type] = product;
        setBuild(updatedBuild);
        
        setProductInfo(product);
    }
    
    const handleOpenModal = (location) => {
        setRedirect(location);
        setOpen(true);
    }
    
    return (
        <Card>
            <Grid container item direction="row" spacing={1}>
                <Grid container item xs={2} direction="column" justify="center" alignItems="center">
                    <Grid item>
                        <Typography align="center" variant="h5">{type.replace("_", " ")}</Typography>
                    </Grid>
                    <Grid item>
                        <Tooltip title={<Typography>{productDesc[type]}</Typography>}>
                            <InfoIcon />
                        </Tooltip>
                    </Grid>
                </Grid>
                <Grid item>
                    <Divider orientation="vertical" />
                </Grid>
                {build.parts[type] === '' || !build.parts[type] ? 
                <Grid container item xs={9} alignItems="center" justify="center">
                    <Grid item>     
                        <Button color="primary" variant="contained" onClick={() => {setOpen(true)}}>Select a Part</Button>
                    </Grid>
                </Grid>
                :
                <Grid item container direction="row" xs={9} spacing={4} className={classes.productInfoContainer}>
                    <Grid item xs={2}>
                        <img className={classes.image} src={"data:image/jpeg;base64,"+build.parts[type].image} alt={productInfo.name}/>
                    </Grid>
                    <Grid item xs={4}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography>Specs</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container item direction="column">
                                {Object.keys(build.parts[type].specs).map((spec, index) => (
                                    <Grid container item direction="row" key={`${build.parts[type].name}-product-card` + index}>
                                        <Grid item>
                                            <Typography>{spec}:</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography>{build.parts[type].specs[spec]}</Typography>
                                        </Grid>
                                    </Grid>
                                ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                    <Grid item container direction="column" xs={2}>
                        <Grid item>             
                            <Typography variant="h6">Product Name</Typography>
                        </Grid>
                        <Grid item>
                            <Typography>{build.parts[type].name}</Typography>
                        </Grid>
                    </Grid>
                    <Grid item container direction="column" xs={2}>
                        <Grid item>             
                            <Typography variant="h6">Price</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h5" className={productInfo.sale && classes.oldSalePrice}>${Number(build.parts[type].price).toFixed(2)}</Typography>
                            {productInfo.sale && 
                            <Typography variant="h5" color="secondary" className={classes.salepercent}>
                                ${(productInfo.price - (productInfo.price * (productInfo.sale.salepercent/100)).toFixed(2))}
                            </Typography>}
                        </Grid>
                    </Grid>
                    <Grid item container direction="column" xs={2} justify="center">
                        <Button color="primary" variant="contained" onClick={()=>{handleOpenModal('compare')}}>Compare</Button>
                        <Button color="primary" variant="contained" onClick={()=>{handleOpenModal('change')}}>Change</Button>
                        <Button color="secondary" variant="contained" onClick={()=>{handleCardUpdate(type, '')}}>Delete</Button>
                    </Grid>
                </Grid>
                }
            </Grid>
            <Modal open={open} onClose={() => {setOpen(false)}}>
                <SelectBuildProductModal 
                    category={type} 
                    setOpen={setOpen} 
                    setProduct={handleCardUpdate}
                    redirect={redirect}
                />
            </Modal>
        </Card>
    
    );

}

export default BuildProductCard;