import React, { createContext, useContext } from "react";

const DarkModeContext = createContext(null);

export const DarkModeProvider = ({ children }) => children;

export const useDarkMode = () => useContext(DarkModeContext);
