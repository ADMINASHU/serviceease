"use client";
import React, { createContext, useContext } from "react";
import axios from "axios";

const CPContext = createContext();

export const CPProviderComponent = ({ children }) => {
  const fetchCPData = async () => {
    let allCPData = [];
  
    try {
      const cookiesResponse = await axios.post("/api/get-cookies");
      const promises = [];
  
      for (let i = 1; i < 10; i++) {
        const payload = { id: i };
        const promise = axios.post("/api/cpData", {
          payload,
          cookies: cookiesResponse.data.cookies,
        });
        promises.push(promise);
      }
  
      const cpResponses = await Promise.all(promises);
      cpResponses.forEach(response => {
        allCPData = [...allCPData, response.data.CPData];
      });
      console.log(allCPData);
  
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  
  return <CPContext.Provider value={{ fetchCPData }}>{children}</CPContext.Provider>;
};

export const useCPContext = () => useContext(CPContext);
