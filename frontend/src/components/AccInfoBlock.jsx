import React from 'react';
import { Button, Divider, Grid, Input, Typography, FormControl, FormHelperText, Avatar } from '@material-ui/core';
import API from '../util/API';
import './styles/profilePage.css';

const api = new API();

const AccInfoblock = ({editComponent, accInfo, shippingInfo, setEditComponent}) => {
    
    const [userInfo, setUserInfo] = React.useState(accInfo);
    
    const [editName, setEditName] = React.useState('');
    const [editEmail, setEditEmail] = React.useState('');
    const [editPhone, setEditPhone] = React.useState('');
    const [editAddr, setEditAddr] = React.useState('');
    const [editCity, setEditCity] = React.useState('');
    const [editPCode, setEditPCode] = React.useState('');
    const [editCountry, setEditCountry] = React.useState('');
    const [editState, setEditState] = React.useState('');

    const [nameError, setNameError] = React.useState('')
    const [emailError, setEmailError] = React.useState('')
    const [pwdError, setPwdError] = React.useState('')
    const [phoneError, setPhoneError] = React.useState('')
    const [addrError, setAddrError] = React.useState('')
    const [cityError, setCityError] = React.useState('')
    const [pCodeError, setPCodeError] = React.useState('')
    const [countryError, setCountryError] = React.useState('')
    const [stateError, setStateError] = React.useState('')
    
    // console.log(shippingInfo);
    React.useEffect(()=>{
        setUserInfo(accInfo);
        setEditName(accInfo.name);
        setEditEmail(accInfo.email);
        setEditPhone(accInfo.phonenumber);
        setEditAddr(shippingInfo.streetaddress);
        setEditCity(shippingInfo.city);
        setEditPCode(shippingInfo.postcode);
        setEditCountry(shippingInfo.country);
        setEditState(shippingInfo.state);
    },[accInfo, shippingInfo.streetaddress, shippingInfo.city, shippingInfo.country, shippingInfo.postcode, shippingInfo.state])

    function checkValidEmail (input) {
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(input);
    }

    function checkInputNumber (input) {
        return /^[0-9]\d*$/.test(input);
    }

    function checkInputAlpha (input) {
        return /^[a-zA-Z ]+$/.test(input);
    }
    
    const handleChange = (value, key) => {
        switch(key) {
            case 'name':
                return setEditName(value);
            case 'email':
                return setEditEmail(value);
            case 'phonenumber':  
                return setEditPhone(value);
            case 'streetaddress':
                return setEditAddr(value);
            case 'city':
                return setEditCity(value);
            case 'postcode':
                return setEditPCode(value);
            case 'country':
                return setEditCountry(value);
            default:
                return setEditState(value);
        }
    }
    
    const convertFieldName = (value) => {
        switch(value) {
            case 'name':
                return 'Name';
            case 'email':
                return 'Email';
            case 'phonenumber':
                return 'Phone Number';
            case 'streetaddress':
                return 'Address';
            case 'city':
                return 'City';
            case 'postcode':
                return 'Postal Code';
            case 'country':
                return 'Country';
            default:
                return 'State';
        }
    }
    
    const getInformationValues = (type) => {
        switch(type) {
            case 'name':
                return editName;
            case 'email':
                return editEmail;
            case 'phonenumber':
                return editPhone;
            case 'streetaddress':
                return editAddr;
            case 'city':
                return editCity;
            case 'postcode':
                return editPCode;
            case 'country':
                return editCountry;
            default:
                return editState;
        }
    }

    const getErrorValues = (type) => {
        switch(type) {
            case 'name':
                return nameError;
            case 'email':
                return emailError;
            case 'phonenumber':
                return phoneError;
            case 'streetaddress':
                return addrError;
            case 'city':
                return cityError;
            case 'postcode':
                return pCodeError;
            case 'country':
                return countryError;
            case 'state':
                return stateError;
            default:
                return '';
        }
    }



    const handleSubmit = async () => {

        setNameError('');
        setEmailError('');
        setPhoneError('');
        setAddrError('');
        setCityError('');
        setPCodeError('');
        setCountryError('');
        setStateError('');

        let error = false;

        if (editName === '') {
            setNameError('Name cannot be empty');
            error = true;
        }

        if (editEmail === '' || !checkValidEmail(editEmail)) {
            setEmailError('Invalid email address');
            error = true;
        }

        if (editPhone === '' || !checkInputNumber(editPhone)) {
            setPhoneError('Invalid phone number');
            error = true;
        }

        if (editCity !== '' && !checkInputAlpha(editCity)) {
            setCityError('Invalid city name');
            error = true;
        }

        if (!(editPCode == null || editPCode === '' || checkInputNumber(editPCode))) {
            console.log("editCode", editPCode);
            setPCodeError('Invalid post code');
            error = true;
        }

        if (editCountry !== '' && !checkInputAlpha(editCountry)) {
            setCountryError('Invalid country name');
            error = true;
        }

        if (editState !== '' && !checkInputAlpha(editState)) {
            setStateError('Invalid state name');
            error = true;
        }


        if (error) return;

        const body = {
            name: editName, 
            email: editEmail, 
            phonenumber: editPhone, 
            streetaddress: editAddr,
            city: editCity,
            postcode: editPCode,
            country: editCountry,
            state: editState
        };
    
        const response = await api.put(`profile?userId=${localStorage.getItem('userId')}`, body);
        setEditComponent(false);
    }
    console.log(shippingInfo);
    const sliceName = () => (editName.slice(0,1));
    const sliceLastName = () => {
        let space = editName.indexOf(' ');
        return editName.slice(space+1, space+2);
    }
    
    const changeValue = (key, value) => {
        const newUserInfo = JSON.parse(JSON.stringify(userInfo));
        newUserInfo[key] = value;
        setUserInfo(newUserInfo);
    }
    
    return (
            <Grid container item direction="column" spacing={2}>
                <Grid container item justify="center"> 
                    <Avatar className="user-avatar">{sliceName() + sliceLastName()}</Avatar>
                </Grid>
                <Grid item>
                    <Typography variant="h3">Account information</Typography>
                </Grid>
                <Divider/>
                {Object.keys(accInfo).map((value) => {  
                    if(value === 'isAdmin' || value === 'password') return '';
                    return <Grid container item direction="row" spacing={10} justify="space-between">
                        <Grid item  className="account-info-field">
                            <Typography variant="h5">{convertFieldName(value) + ':'}</Typography>
                        </Grid>
                        <Grid item className="account-info-field">
                            {editComponent === true ?
                                <Grid item>
                                    <FormControl error={getErrorValues(value) === '' ? false : true}>
                                        <Input value={getInformationValues(value)} onChange={(event) => {handleChange(event.target.value, value)}} />
                                        <FormHelperText>{getErrorValues(value)}</FormHelperText>
                                    </FormControl>
                                </Grid>
                            :
                            <Grid item>
                                <Typography variant="h5">{getInformationValues(value)}</Typography>
                            </Grid>
                            }
                        </Grid>
                    </Grid>
                     })}
                <Grid item>
                    <Typography variant="h3">Shipping information</Typography>
                </Grid>
                <Divider/>
                {Object.keys(shippingInfo).map((value) => (
                    <Grid container item direction="row" spacing={10} justify="space-between">
                        <Grid item className="account-info-field">
                            <Typography variant="h5">{convertFieldName(value) + ':'}</Typography>
                        </Grid>
                        <Grid item className="account-info-field">
                            {editComponent === true ?
                                <Grid item>
                                    <FormControl error={getErrorValues(value) === '' ? false : true}>
                                        <Input value={getInformationValues(value)} onChange={(event) => {handleChange(event.target.value, value)}} />
                                        <FormHelperText>{getErrorValues(value)}</FormHelperText>
                                    </FormControl>
                                </Grid>
                            :
                                <Grid item>
                                    <Typography variant="h5">{getInformationValues(value)}</Typography>
                                </Grid>
                            }
                        </Grid>
                    </Grid>
                ))}
                {editComponent ? <Grid item>
                    <Button color="primary" variant="contained" onClick={() => handleSubmit()}>Confirm Changes</Button>
                </Grid> : ''}
            </Grid>
    );

}

export default AccInfoblock;