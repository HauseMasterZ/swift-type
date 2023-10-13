import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';


function ProtectedRoute({ component: Component, ...rest }) {
    const user = auth.currentUser;

    return user ? <Component {...rest} /> : <Navigate to="/signup" />;
}

export default ProtectedRoute;