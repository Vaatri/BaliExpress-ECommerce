import { Button, Grid, makeStyles, Modal, Typography } from '@material-ui/core';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import CompareProductCard from '../components/buildPageComponents/CompareProductCard';
import SelectBuildProductModal from '../components/buildPageComponents/SelectBuildProductModal';
import { StoreContext } from '../util/store';

const useStyles = makeStyles((theme) => ({
    productContainer: {
        border: '1px solid white',
        margin: '2em',
    }
}))

const ComparePage = () => {
    const context = React.useContext(StoreContext);
    const history = useHistory();
    const classes = useStyles();
    const { category } = useParams();
    const {build: [build, setBuild]} = context;
    const { comparedProduct: [comparedProduct, setComparedProduct] } = context;
    const [open, setOpen] = React.useState(false);
    
    const redirectHandler = () => {
        history.push({pathname:'/build', state: {type: 'exchange'}});
    }
    
    
    
    const exchangeHandler = () => {
        const updatedBuild = JSON.parse(JSON.stringify(build));
        updatedBuild.parts[category] = comparedProduct;
        setBuild(updatedBuild);
        history.push({pathname:'/build', state: {type: 'exchange'}});
    }
    
    const reselectHandler = () => {
        setOpen(true);
    }


    return(
        <Grid container direction="column" alignItems="center">
            <Grid item>
                <Typography variant="h4" className="light-text">COMPARE YOUR PRODUCTS</Typography>
            </Grid>
            <Grid container item direction="row">
                <Grid 
                    item xs={5} 
                    className={classes.productContainer}
                >
                    <CompareProductCard productInfo={build.parts[category]} />    
                </Grid>
                <Grid 
                    item 
                    xs={5} 
                    className={classes.productContainer}
                >
                    {comparedProduct && <CompareProductCard productInfo={comparedProduct} />}
                </Grid>
            </Grid>
            <Grid container item direction="row" justify="center" spacing={2}>
                <Grid item>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => {redirectHandler();}}
                    >
                        Take me Back!
                    </Button>
                </Grid>
                <Grid item>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => {exchangeHandler();}}
                    >
                        Exchange Product
                    </Button>
                </Grid>
                <Grid item>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => {reselectHandler();}}
                    >
                        Compare another Product
                    </Button>
                </Grid>
            </Grid>
            <Modal open={open} onClose={() => {setOpen(false)}}>
                <SelectBuildProductModal
                    category={category}
                    setOpen={setOpen}
                    setProduct={setComparedProduct}
                    setComparedProduct={setComparedProduct}
                    redirect={'compare'}
                    />
            </Modal>
        </Grid>
    )

}

export default ComparePage;