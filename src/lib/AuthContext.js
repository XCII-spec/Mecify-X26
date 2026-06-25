import React, { createContext, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  return children;
};

export const useAuth = () => useContext(AuthContext);
