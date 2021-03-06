import { Button, Grid, Paper, Typography } from '@material-ui/core';
import React from 'react';
import API from '../../util/API';
import CanvasJSReact from '../../canvasjs/canvasjs.react';
const api = new API();
var CanvasJSChart = CanvasJSReact.CanvasJSChart;


const ProductStats = ({setOpen, productInfo}) => {
    console.log(productInfo)
    const [stats, setStats] = React.useState([]);
    const [chartOptions, setChartOptions] = React.useState(null);
    
    React.useEffect(() => {
        (async () => {
            const data = await api.get(`stats?productId=${productInfo.id}`);
            const dps = JSON.parse(JSON.stringify(data.stats));
            dps.forEach((stat) => stat.x = new Date(stat.x))
            const options = {
                zoomEnabled: true,
                title: {
                    text: 'Product sold from 1st Jan 2020',
                },
                axisY: {
                    title: 'Units Sold'
                },
                axisX: {
                    title: 'Date'
                },
                data: [
                    {
                        type: 'line',
                        dataPoints: dps
                    }
                ]
                
            }
            setChartOptions(options);
            console.log(data.stats);
        })();
        
    }, [productInfo.id]);
    
    
    return(
        <Grid container>
            <Grid item>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => {setOpen(false)}}
                >
                    Go Back
                </Button>
            </Grid>
            <Grid item>
                <Typography variant="h4">Statistics for {productInfo.name}</Typography>
            </Grid>
            <Grid container item direction="row" spacing={3} justify="center">
                    <Grid item>
                        <Typography variant="h6">Product ID: {productInfo.id}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="h6">Stock: {productInfo.stock}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="h6">Units Sold: {productInfo.sold}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="h6">Product Price: ${productInfo.price.toFixed(2)}</Typography>
                    </Grid>
            </Grid>
            <CanvasJSChart options={chartOptions} />
        </Grid>
    );
}

export default ProductStats;