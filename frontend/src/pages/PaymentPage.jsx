import { Button, Divider, Grid, makeStyles, Paper, Snackbar, Typography } from '@material-ui/core';
import { useHistory } from 'react-router';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import PaymentBlock from '../components/PaymentComponents/PaymentBlock';
import ShippingBlock from '../components/PaymentComponents/ShippingBlock';
import API from '../util/API';
import { StoreContext } from '../util/store';
import CartComponent from '../components/PaymentComponents/CartComponent';
import DeliveryBlock from '../components/PaymentComponents/DeliveryBlock';
import BillingAddressBlock from '../components/PaymentComponents/BillingAddressBlock';

const api = new API();

const useStyles = makeStyles(() => ({

    block: {
        'margin-top': '0.5em',
        'margin-bottom': '0.5em',
        'width': '100%'
    },

}))

const PaymentPage = () => {

    const context = React.useContext(StoreContext);
    const { cart: [cart, setCart] } = context;
    const classes = useStyles();
    const history = useHistory();
    const [user, setUser] = React.useState(null);
    const [paymentDetails, setPaymentDetails] = React.useState({'name': '', 'type': '', 'number': '', 'month':'', 'year':'', 'cvn':''});
    const [paymentErrors, setPaymentErrors] = React.useState({'name': '', 'type': '', 'number': '', 'date':'', 'cvn':''});
    const [shippingDetails, setShippingDetails] = React.useState({  'address': '', 
                                                                    'city': '',
                                                                    'postcode': '',
                                                                    'state': '',
                                                                    'country': ''});
    const [shippingErrors, setShippingErrors] = React.useState({'address': '', 
                                                                'city': '',
                                                                'postcode': '',
                                                                'state': '',
                                                                'country': ''});
    const [billingDetails, setBillingDetails] = React.useState({  'address': '', 
                                                                    'city': '',
                                                                    'postcode': '',
                                                                    'state': '',
                                                                    'country': ''});
    const [billingErrors, setBillingErrors] = React.useState({'address': '', 
                                                                'city': '',
                                                                'postcode': '',
                                                                'state': '',
                                                                'country': ''});
    const [shippingPrice, setShippingPrice] = React.useState(0);
    const [sameBilling, setSameBilling] = React.useState(false);
    const [shipped, setShipped] = React.useState(true);
    const [deliveryError, setDeliveryError] = React.useState(false);
                                                                
    const calculateTotal = () => {
        let total = 0;
        for(const i in cart){
            total += (parseInt(cart[i].price) * cart[i].quantity);
        }
        return total;
    }
    
    const [price, setPrice] = React.useState(calculateTotal());

    React.useEffect(() => {
        (async () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                const response = await api.get(`profile?userId=${userId}`);
                const account = response.accountInfo;
                setUser(account);
                console.log(user);

                // Get the shipping information from the user
                const newShippingDetails = JSON.parse(JSON.stringify(shippingDetails));
                newShippingDetails['address'] = account.streetaddress;
                newShippingDetails['city'] = account.city;
                newShippingDetails['postcode'] = account.postcode;
                newShippingDetails['state'] = account.state;
                newShippingDetails['country'] = account.country;
                setShippingDetails(newShippingDetails);
            }
        })();
    },[]);
    
    function checkInputNumber (input) {
        return /^[1-9]\d*$/.test(input);
    }

    function checkInputAlpha (input) {
        return /^[a-zA-Z ]+$/.test(input);
    }

    // Check for any errors in both the shipping and payment blocks
    const checkErrors = (newShippingErrors, newBillingErrors, newPaymentErrors) => {

        console.log("Checking for errors...")
        console.log("Shipping Info:", shippingDetails);
        console.log("Payment Info:", paymentDetails);
        console.log("Billing Address:", billingDetails);

        let error = false;

        // Check for any empty fields, and the associated input types are correct, e.g. numbers only for postcode
        if (shipped) {
            Object.keys(shippingDetails).forEach(field => {
                if (shippingDetails[field] === '') {
                    newShippingErrors[field] = field.charAt(0).toUpperCase() + field.slice(1) + ' cannot be empty';
                    error = true;
                } else if (field === 'city' || field === 'state' || field === 'country'){
                    if (!checkInputAlpha(shippingDetails[field])) {
                        newShippingErrors[field] = 'Invalid ' + field;
                        error = true;
                    };
                } else if (field === 'postcode') {
                    if (!checkInputNumber(shippingDetails[field])) {
                        newShippingErrors[field] = 'Invalid ' + field;
                        error = true;
                    };
                };
            });
        }

        // Check for any empty fields, and the associated input types are correct, e.g. numbers only for postcode
        Object.keys(billingDetails).forEach(field => {
            if (billingDetails[field] === '') {
                newBillingErrors[field] = field.charAt(0).toUpperCase() + field.slice(1) + ' cannot be empty';
                error = true;
            } else if (field === 'city' || field === 'state' || field === 'country'){
                if (!checkInputAlpha(billingDetails[field])) {
                    newBillingErrors[field] = 'Invalid ' + field;
                    error = true;
                };
            } else if (field === 'postcode') {
                if (!checkInputNumber(billingDetails[field])) {
                    newBillingErrors[field] = 'Invalid ' + field;
                    error = true;
                };
            };
        });

        // Check if any fields in the payment block are empty
        if (paymentDetails.name === '') {
            newPaymentErrors['name'] = "Please enter the cardholder's name";
        } else if (!checkInputAlpha(paymentDetails.name)) {
            newPaymentErrors['name'] = "Invalid cardholder name";
        }

        if (paymentDetails.type === '') {
            newPaymentErrors['type'] = "Please select your card type";
            error = true;
        }

        // Card number should be a specific length
        if (paymentDetails.number === '') {
            newPaymentErrors['number'] = "Credit Card Number cannot be empty";
            error = true;
        } else if (String(paymentDetails.number).length !== 16) {
            newPaymentErrors['number'] = "Credit Card Number Invalid"
            error = true;
        }
        
        const today = new Date();
        const year = today.getFullYear() % 2000;
        const month = today.getMonth() + 1;
        console.log("year", year, "month", month);
        console.log("entered year", paymentDetails.year, "entered month", paymentDetails.month);

        // Expiry date should not be empty and not expired
        if (paymentDetails.month === '' || paymentDetails.year === '') {
            newPaymentErrors['date'] = "Please enter your expiry date";
        } else {
            if (paymentDetails.year < year || (paymentDetails.year === year && paymentDetails.month < month)) {
                newPaymentErrors['date'] = "Invalid card: Exceeded expiry date";
            }
        }
        
        // CVV should also be a specific length of 3
        if (String(paymentDetails.cvn).length !== 3) {
            newPaymentErrors['cvn'] = "CVV is invalid";
            error = true;
        }

        if (shipped && shippingPrice === 0) {
            setDeliveryError(true);
            error = true;
        }

        // If either block has an error, display the errors, and do not continue with the purchase
        if (error) {
            setShippingErrors(newShippingErrors);
            setBillingErrors(newBillingErrors);
            setPaymentErrors(newPaymentErrors);
            return false; 
        };


        return true;
    }

    const handleSubmit = async () => {

        // Reset the errors for both shipping and payment
        const newShippingErrors = JSON.parse(JSON.stringify(shippingErrors));
        Object.keys(shippingErrors).forEach(field => newShippingErrors[field]='');

        const newBillingErrors = JSON.parse(JSON.stringify(billingErrors));
        Object.keys(billingErrors).forEach(field => newBillingErrors[field]='');
        
        const newPaymentErrors = JSON.parse(JSON.stringify(paymentErrors));
        Object.keys(paymentErrors).forEach(field => newPaymentErrors[field]='');

        // Check if there are any errors in either block
        if (!checkErrors(newShippingErrors, newBillingErrors, newPaymentErrors)) {
            console.log('There was an error');
        } else {
            console.log('No errors were found');

            // Get the items from the cart, and put the id and quanity into a new dict
            const products = {};
            const builds = [];
            cart.forEach(item => {
                if (item.parts) builds.push(item);
                else products[item.id] = item.quantity;
            });

            // Send the api call to make a new order
            const body = {
                userId: localStorage.getItem('userId'),
                products: products,
                builds: builds,
                shipping: shippingDetails,
                shippingPrice: shippingPrice,
                total: price
            };

            console.log(body);

            const response = await api.post(`order`, body);
            console.log(response);

            // If successful, remove the items from the cart, set the orderId in localStorage,
            // and redirect to the order confirm page
            if (response) {
                setCart([]);
                localStorage.setItem('orderId', response.orderId);
                history.push(`order`);
            }

        }
    }

    return (
        <Grid container direciton="row" alignItems="flex-start" justify="center">
            <Grid container item direction="column" xs={6} alignItems="center">   
                <Grid item className={classes.block} xs={12}>
                    <DeliveryBlock 
                        setShippingPrice={setShippingPrice} 
                        setShipped={setShipped}
                        setSameBilling={setSameBilling}
                    />
                </Grid>
                {user && shipped && 
                    <Grid item className={classes.block} xs={12}>
                        <ShippingBlock 
                            shipping={shippingDetails} 
                            errors={shippingErrors}
                            sameBilling={sameBilling}
                            setShippingDetails={setShippingDetails}
                            setBillingDetails={setBillingDetails}
                            shipped={shipped}
                        />
                    </Grid>
                }
                <Grid item className={classes.block} xs={12}>
                    <BillingAddressBlock 
                        shipping={shippingDetails}
                        billing={billingDetails}
                        errors={billingErrors}
                        sameBilling={sameBilling}
                        setBillingDetails={setBillingDetails}
                        setSameBilling={setSameBilling}
                        shipped={shipped}
                    />
                </Grid>
                <Grid item className={classes.block} xs={12}>
                    <PaymentBlock   
                        payment={paymentDetails}
                        errors={paymentErrors}
                        setPaymentDetails={setPaymentDetails}
                    />
                </Grid>
                <Grid item>
                    <Button
                        color="primary" 
                        variant="contained"
                        onClick={() => handleSubmit()}
                    >
                        Make Order
                    </Button>
                </Grid>
            </Grid>
            <Grid item xs={4}>
                <CartComponent totalPrice={price} shippingPrice={shippingPrice}/>
            </Grid>
            <Snackbar open={deliveryError} autoHideDuration={1500} onClose={() => setDeliveryError(false)}>
                <Alert severity="error">Please select a shipping option</Alert>
            </Snackbar>
        </Grid>
    )
}

export default PaymentPage;