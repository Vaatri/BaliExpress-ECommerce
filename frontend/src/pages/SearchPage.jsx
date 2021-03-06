import { Typography, Grid } from '@material-ui/core';
import React from 'react';
import { useParams } from 'react-router';
import ProductCard from '../components/ProductCard';
import API from '../util/API';
import '../App.css';
const api = new API();

const SearchPage = () => {
    const { search } = useParams();
    const [productOutput, setProductOutput] = React.useState([]);

    React.useEffect(() => {
        (async () => {
            const res = await api.get(`search?query=${search}`);
            setProductOutput(res.results);
        })();
    },[search])
    
    return (
        <div>
            <Typography variant="h2" className="text-center">
                Search query for: {search}
            </Typography>
            <Grid container item direction="row" spacing={3} className="universal-padding">
                {productOutput.map((p) => (
                    <Grid item xs={3}>
                        <ProductCard 
                            pid={p.id}
                            name={p.name}
                            price={p.price}
                            image={p.image}
                            category={p.category}
                        />
                    </Grid>
                ))}
            </Grid>
        </div>
            
    )

}

export default SearchPage;