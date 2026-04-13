import React from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuth from '../hooks/useAuth';
import Loading from '../components/common/Loading';

const PrivateRoute = ({children}) => {
    const {user , loading} = useAuth()
    const location = useLocation();

    if(loading) {
        return <Loading/>
    }

    if(!user){
        return <Navigate state={{from: location.pathname}} to='/signin' replace/>
    }
    return children;
};

export default PrivateRoute;