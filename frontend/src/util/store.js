import React from 'react';

export const StoreContext = React.createContext(null);

// eslint-disable-next-line import/no-anonymous-default-export
export default ({ children }) => {
    const [build, setBuild] = React.useState({
        'Cases': '', 
        'Motherboards':'', 
        'CPU':'',
        'Graphics_Cards':'', 
        'Memory': '',
        'Storage': '',
        'PSU': '', 
        'CPU_Cooling':'',
        });
    const [cart, setCart] = React.useState([]);
    const store = {
        build: [build, setBuild],
        cart: [cart, setCart],
    };
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>

};