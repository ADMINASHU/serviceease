// context/DataContext.js
"use client"
import React, { createContext, useState } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [cookies, setCookies] = useState(null);
  const [htmlResponse, setHtmlResponse] = useState(null);
  const [transformedData, setTransformedData] = useState(null);

  return (
    <DataContext.Provider
      value={{ cookies, setCookies, htmlResponse, setHtmlResponse, transformedData, setTransformedData }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
