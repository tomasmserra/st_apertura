import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { authenticationService } from '../services';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        // Verificar si hay token y si la sesión no ha expirado
        const token = localStorage.getItem('token');
        const isValidSession = authenticationService.checkSessionValidity();
        
        console.log('ProtectedRoute - token:', token);
        console.log('ProtectedRoute - isValidSession:', isValidSession);
        console.log('ProtectedRoute - path:', props.location.pathname);
        
        if (token && isValidSession) {
          console.log('ProtectedRoute - Access granted');
          return <Component {...props} />;
        } else {
          console.log('ProtectedRoute - Access denied, redirecting to /');
          // Redirigir al login si no está autenticado o la sesión expiró
          return <Redirect to="/" />;
        }
      }}
    />
  );
};

export default ProtectedRoute;
