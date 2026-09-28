import React, { createContext, useState, useContext , useEffect} from 'react';

// Create AuthContext
const AuthContext = createContext();

// Custom hook for using the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component that provides the authentication state
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token , setToken] = useState(JSON.parse(sessionStorage.getItem("auth")) ? JSON.parse(sessionStorage.getItem("auth")).token : "")
 
  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  useEffect(()=>{
     setToken(JSON.parse(sessionStorage.getItem("auth")) ? JSON.parse(sessionStorage.getItem("auth")).token : "") 
  },[isAuthenticated])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout , token }}>
      {children}
    </AuthContext.Provider>
  );
};
